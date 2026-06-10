import mongoose from 'mongoose';
import Ride from '../models/Ride.js';
import Rating from '../models/Rating.js';
import { asyncHandler } from '../utils/http.js';

const oid = (id) => new mongoose.Types.ObjectId(id);

/**
 * GET /api/analytics/driver   (driver only)
 * Powers the Driver Dashboard: summary cards, status breakdown, rides-over-time,
 * earnings, recent ratings.
 */
export const driverDashboard = asyncHandler(async (req, res) => {
  const driverId = oid(req.user._id);

  const [byStatus] = await Promise.all([
    Ride.aggregate([
      { $match: { driver: driverId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusMap = byStatus.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  const completed = statusMap.completed || 0;
  const active = (statusMap.accepted || 0) + (statusMap.in_progress || 0);
  const cancelled = statusMap.cancelled || 0;
  const total = byStatus.reduce((sum, s) => sum + s.count, 0);

  // Earnings from completed rides.
  const [earnAgg] = await Ride.aggregate([
    { $match: { driver: driverId, status: 'completed' } },
    { $group: { _id: null, earnings: { $sum: '$fare' }, distance: { $sum: '$distanceKm' } } },
  ]);

  // Completed rides per day for the last 7 days (chart series).
  const ridesPerDay = await Ride.aggregate([
    { $match: { driver: driverId, status: 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        rides: { $sum: 1 },
        earnings: { $sum: '$fare' },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const recentRatings = await Rating.find({ driver: driverId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'passenger', select: 'name' });

  res.json({
    summary: {
      totalRides: total,
      completedRides: completed,
      activeRides: active,
      cancelledRides: cancelled,
      earnings: earnAgg?.earnings || 0,
      distanceKm: Number((earnAgg?.distance || 0).toFixed(1)),
      ratingAvg: req.user.ratingAvg,
      ratingCount: req.user.ratingCount,
    },
    statusBreakdown: statusMap,
    ridesPerDay: ridesPerDay.map((d) => ({ date: d._id, rides: d.rides, earnings: d.earnings })),
    recentRatings,
  });
});

/**
 * GET /api/analytics/demand   (any authenticated user) — BONUS
 * Campus-wide demand insights: peak hours, popular pickups, daily volume.
 */
export const demandAnalytics = asyncHandler(async (req, res) => {
  // Rides per hour of day (peak demand hours).
  const peakHours = await Ride.aggregate([
    { $group: { _id: { $hour: '$requestedAt' }, rides: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Most popular pickup points.
  const popularPickups = await Ride.aggregate([
    { $group: { _id: '$pickup.label', rides: { $sum: 1 } } },
    { $sort: { rides: -1 } },
    { $limit: 8 },
  ]);

  // Daily ride volume (demand pattern over time).
  const dailyVolume = await Ride.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$requestedAt' } },
        rides: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const totals = await Ride.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    peakHours: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      rides: peakHours.find((p) => p._id === h)?.rides || 0,
    })),
    popularPickups: popularPickups.map((p) => ({ location: p._id, rides: p.rides })),
    dailyVolume: dailyVolume.map((d) => ({ date: d._id, rides: d.rides })),
    statusTotals: totals.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
  });
});
