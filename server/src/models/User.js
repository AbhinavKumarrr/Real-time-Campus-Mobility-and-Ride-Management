import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    label: { type: String, default: '' },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const vehicleSchema = new Schema(
  {
    type: { type: String, enum: ['e-rickshaw', 'auto', 'cab', 'bike'], default: 'e-rickshaw' },
    model: { type: String, default: '' },
    plateNumber: { type: String, default: '' },
    color: { type: String, default: '' },
    capacity: { type: Number, default: 3 },
  },
  { _id: false }
);

const verificationSchema = new Schema(
  {
    licenseNumber: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['passenger', 'driver'], required: true },

    vehicle: { type: vehicleSchema, default: undefined },
    verification: { type: verificationSchema, default: undefined },

    // Availability for drivers.
    isOnline: { type: Boolean, default: false },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
    },
    currentLocation: { type: locationSchema, default: () => ({}) },

    // Aggregate rating (drivers).
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function toPublic() {
  const obj = this.toObject({ versionKey: false });
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
