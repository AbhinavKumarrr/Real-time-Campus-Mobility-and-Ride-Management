import Ride from '../models/Ride.js';
import User from '../models/User.js';
import { haversineKm, estimateFare } from '../utils/geo.js';
import {
  asyncHandler,
  badRequest,
  notFound,
  forbidden,
  conflict,
} from '../utils/http.js';
import {
  SocketEvents,
  emitToUser,
  emitToDrivers,
  emitToRide,
} from '../sockets/registry.js';

const RIDE_POPULATE = [
  { path: 'passenger', select: 'name phone' },
  { path: 'driver', select: 'name phone vehicle currentLocation ratingAvg ratingCount' },
];

const populated = (id) => Ride.findById(id).populate(RIDE_POPULATE);

export const requestRide = asyncHandler(async (req, res) => {
  const { pickup, destination, notes } = req.body;
  if (!pickup?.label || pickup.lat == null || !destination?.label || destination.lat == null) {
    throw badRequest('pickup and destination (label, lat, lng) are required');
  }

  // One active ride per passenger at a time.
  const active = await Ride.findOne({
    passenger: req.user._id,
    status: { $in: ['requested', 'accepted', 'in_progress'] },
  });
  if (active) throw conflict('You already have an active ride');

  const distanceKm = Number(haversineKm(pickup, destination).toFixed(2));
  const fare = estimateFare(distanceKm);

  const ride = await Ride.create({
    passenger: req.user._id,
    pickup,
    destination,
    notes: notes || '',
    distanceKm,
    fare,
  });

  const full = await populated(ride._id);

  emitToDrivers(SocketEvents.RIDE_NEW, full);

  res.status(201).json({ ride: full });
});

export const listMyRides = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'passenger'
    ? { passenger: req.user._id }
    : { driver: req.user._id };

  if (req.query.status) {
    filter.status = { $in: String(req.query.status).split(',') };
  }

  const rides = await Ride.find(filter).sort({ createdAt: -1 }).populate(RIDE_POPULATE);
  res.json({ rides });
});

export const listOpenRequests = asyncHandler(async (req, res) => {
  const rides = await Ride.find({
    status: 'requested',
    driver: null,
    rejectedBy: { $ne: req.user._id },
  })
    .sort({ createdAt: -1 })
    .populate(RIDE_POPULATE);
  res.json({ rides });
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await populated(req.params.id);
  if (!ride) throw notFound('Ride not found');
  assertParticipant(ride, req.user);
  res.json({ ride });
});

export const acceptRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: req.params.id, status: 'requested', driver: null },
    {
      $set: { driver: req.user._id, status: 'accepted', acceptedAt: new Date() },
    },
    { new: true }
  );

  if (!ride) {
    const exists = await Ride.exists({ _id: req.params.id });
    throw exists
      ? conflict('This ride has already been taken')
      : notFound('Ride not found');
  }

  // Driver busy.
  await User.findByIdAndUpdate(req.user._id, { availabilityStatus: 'busy' });

  const full = await populated(ride._id);

  emitToUser(ride.passenger, SocketEvents.RIDE_ASSIGNED, full); // passenger
  emitToRide(ride._id, SocketEvents.RIDE_UPDATED, full); // ride room
  emitToDrivers(SocketEvents.RIDE_REQUEST_CLOSED, { rideId: ride._id }); // other drivers

  res.json({ ride: full });
});

export const rejectRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw notFound('Ride not found');
  if (ride.status !== 'requested') throw conflict('Ride is no longer open');

  await Ride.updateOne(
    { _id: ride._id },
    { $addToSet: { rejectedBy: req.user._id } }
  );
  res.json({ ok: true });
});

export const startRide = asyncHandler(async (req, res) =>
  transition(req, res, {
    from: 'accepted',
    to: 'in_progress',
    role: 'driver',
    stamp: 'startedAt',
  })
);

export const completeRide = asyncHandler(async (req, res) =>
  transition(req, res, {
    from: 'in_progress',
    to: 'completed',
    role: 'driver',
    stamp: 'completedAt',
    after: async (ride) => {
      await User.findByIdAndUpdate(ride.driver, { availabilityStatus: 'available' });
    },
  })
);

export const cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw notFound('Ride not found');
  assertParticipant(ride, req.user);

  if (['completed', 'cancelled'].includes(ride.status)) {
    throw conflict(`Ride is already ${ride.status}`);
  }

  ride.status = 'cancelled';
  ride.cancelledAt = new Date();
  ride.cancelledBy = req.user.role;
  await ride.save();

  if (ride.driver) {
    await User.findByIdAndUpdate(ride.driver, { availabilityStatus: 'available' });
  }

  const full = await populated(ride._id);
  emitToRide(ride._id, SocketEvents.RIDE_CANCELLED, full);
  emitToUser(ride.passenger, SocketEvents.RIDE_CANCELLED, full);
  if (ride.driver) emitToUser(ride.driver, SocketEvents.RIDE_CANCELLED, full);
  emitToDrivers(SocketEvents.RIDE_REQUEST_CLOSED, { rideId: ride._id });

  res.json({ ride: full });
});


function assertParticipant(ride, user) {
  const isPassenger = ride.passenger.equals(user._id);
  const isDriver = ride.driver && ride.driver.equals(user._id);
  if (!isPassenger && !isDriver) throw forbidden('You are not part of this ride');
}


async function transition(req, res, { from, to, role, stamp, after }) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw notFound('Ride not found');

  if (role === 'driver' && (!ride.driver || !ride.driver.equals(req.user._id))) {
    throw forbidden('You are not the assigned driver');
  }
  if (ride.status !== from) {
    throw conflict(`Cannot move a ride from "${ride.status}" to "${to}"`);
  }

  ride.status = to;
  if (stamp) ride[stamp] = new Date();
  await ride.save();
  if (after) await after(ride);

  const full = await populated(ride._id);
  emitToRide(ride._id, SocketEvents.RIDE_UPDATED, full);
  emitToUser(ride.passenger, SocketEvents.RIDE_UPDATED, full);
  if (ride.driver) emitToUser(ride.driver, SocketEvents.RIDE_UPDATED, full);

  res.json({ ride: full });
}
