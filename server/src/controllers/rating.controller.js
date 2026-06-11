import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import {
  asyncHandler,
  badRequest,
  notFound,
  forbidden,
  conflict,
} from '../utils/http.js';

export const createRating = asyncHandler(async (req, res) => {
  const { rideId, stars, feedback } = req.body;
  if (!rideId || stars == null) throw badRequest('rideId and stars are required');
  if (stars < 1 || stars > 5) throw badRequest('stars must be between 1 and 5');

  const ride = await Ride.findById(rideId);
  if (!ride) throw notFound('Ride not found');
  if (!ride.passenger.equals(req.user._id)) throw forbidden('You can only rate your own rides');
  if (ride.status !== 'completed') throw conflict('Only completed rides can be rated');
  if (ride.rated) throw conflict('This ride has already been rated');

  const rating = await Rating.create({
    ride: ride._id,
    passenger: ride.passenger,
    driver: ride.driver,
    stars,
    feedback: feedback || '',
  });

  ride.rated = true;
  await ride.save();

  await recomputeDriverRating(ride.driver);

  res.status(201).json({ rating });
});

export const getDriverRatings = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.params.id).select('name ratingAvg ratingCount');
  if (!driver || driver.role === 'passenger') {}
  const ratings = await Rating.find({ driver: req.params.id })
    .sort({ createdAt: -1 })
    .populate({ path: 'passenger', select: 'name' });

  res.json({
    summary: { ratingAvg: driver?.ratingAvg ?? 0, ratingCount: driver?.ratingCount ?? 0 },
    ratings,
  });
});

async function recomputeDriverRating(driverId) {
  const [agg] = await Rating.aggregate([
    { $match: { driver: new mongoose.Types.ObjectId(driverId) } },
    { $group: { _id: '$driver', avg: { $avg: '$stars' }, count: { $sum: 1 } } },
  ]);
  await User.findByIdAndUpdate(driverId, {
    ratingAvg: agg ? Number(agg.avg.toFixed(2)) : 0,
    ratingCount: agg ? agg.count : 0,
  });
}
