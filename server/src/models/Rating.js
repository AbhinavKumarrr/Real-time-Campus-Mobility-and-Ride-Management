import mongoose from 'mongoose';

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, unique: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
