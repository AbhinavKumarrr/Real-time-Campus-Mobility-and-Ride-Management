import mongoose from 'mongoose';

const { Schema } = mongoose;

export const RIDE_STATUSES = [
  'requested',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
];

const pointSchema = new Schema(
  {
    label: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const rideSchema = new Schema(
  {
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    pickup: { type: pointSchema, required: true },
    destination: { type: pointSchema, required: true },

    status: {
      type: String,
      enum: RIDE_STATUSES,
      default: 'requested',
      index: true,
    },

    distanceKm: { type: Number, default: 0 },
    fare: { type: Number, default: 0 },

    notes: { type: String, default: '' },

    // Drivers who explicitly rejected - so we don't re-offer to them.
    rejectedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Lifecycle timestamps.
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: String, enum: ['passenger', 'driver', null], default: null },

    // If Passenger rated
    rated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

rideSchema.index({ status: 1, createdAt: -1 });

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
