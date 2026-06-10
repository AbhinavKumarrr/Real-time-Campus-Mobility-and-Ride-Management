import User from '../models/User.js';
import { asyncHandler, badRequest } from '../utils/http.js';
import {
  SocketEvents,
  emitToPassengers,
} from '../sockets/registry.js';

/**
 * GET /api/drivers/available
 * Public-ish (auth required): list drivers who are online & available,
 * so passengers can see supply before requesting.
 */
export const listAvailableDrivers = asyncHandler(async (req, res) => {
  const drivers = await User.find({
    role: 'driver',
    isOnline: true,
    availabilityStatus: 'available',
  }).select('name vehicle currentLocation ratingAvg ratingCount availabilityStatus');

  res.json({ drivers });
});

/**
 * PATCH /api/drivers/availability   (driver only)
 * Body: { isOnline: boolean, status?: 'available' | 'busy' | 'offline' }
 */
export const setAvailability = asyncHandler(async (req, res) => {
  const { isOnline, status } = req.body;
  const user = req.user;

  if (typeof isOnline === 'boolean') user.isOnline = isOnline;

  if (status) {
    if (!['available', 'busy', 'offline'].includes(status)) {
      throw badRequest('invalid availability status');
    }
    user.availabilityStatus = status;
  } else {
    user.availabilityStatus = user.isOnline ? 'available' : 'offline';
  }

  await user.save();

  // Tell passengers the supply picture changed.
  emitToPassengers(SocketEvents.DRIVER_AVAILABILITY, {
    driverId: user._id,
    name: user.name,
    isOnline: user.isOnline,
    status: user.availabilityStatus,
    vehicle: user.vehicle,
    location: user.currentLocation,
  });

  res.json({ user: user.toPublic() });
});

/**
 * PATCH /api/drivers/location   (driver only)
 * Body: { lat, lng }
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) throw badRequest('lat and lng are required');

  req.user.currentLocation = { lat, lng, updatedAt: new Date() };
  await req.user.save();

  emitToPassengers(SocketEvents.DRIVER_LOCATION, {
    driverId: req.user._id,
    lat,
    lng,
    at: new Date().toISOString(),
  });

  res.json({ currentLocation: req.user.currentLocation });
});
