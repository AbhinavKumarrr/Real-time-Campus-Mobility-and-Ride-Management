import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { asyncHandler, badRequest, unauthorized } from '../utils/http.js';

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone, role, vehicle?, verification? }
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, vehicle, verification } = req.body;

  if (!name || !email || !password || !role) {
    throw badRequest('name, email, password and role are required');
  }
  if (!['passenger', 'driver'].includes(role)) {
    throw badRequest('role must be "passenger" or "driver"');
  }
  if (password.length < 6) {
    throw badRequest('password must be at least 6 characters');
  }

  const user = new User({ name, email, phone, role });
  await user.setPassword(password);

  if (role === 'driver') {
    user.vehicle = {
      type: vehicle?.type || 'e-rickshaw',
      model: vehicle?.model || '',
      plateNumber: vehicle?.plateNumber || '',
      color: vehicle?.color || '',
      capacity: vehicle?.capacity || 3,
    };
    user.verification = {
      licenseNumber: verification?.licenseNumber || '',
      // Auto-verify in this campus demo; a real system would review docs.
      verified: true,
    };
  }

  await user.save();
  const token = signToken(user);
  res.status(201).json({ token, user: user.toPublic() });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw badRequest('email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw unauthorized('Invalid email or password');

  const ok = await user.verifyPassword(password);
  if (!ok) throw unauthorized('Invalid email or password');

  const token = signToken(user);
  res.json({ token, user: user.toPublic() });
});

/**
 * GET /api/auth/me
 */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});

/**
 * PATCH /api/auth/profile
 * Updatable: name, phone, and (drivers) vehicle / verification.licenseNumber
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, vehicle, verification } = req.body;
  const user = req.user;

  if (name != null) user.name = name;
  if (phone != null) user.phone = phone;

  if (user.role === 'driver') {
    if (vehicle) {
      user.vehicle = { ...user.vehicle?.toObject?.(), ...vehicle };
    }
    if (verification?.licenseNumber != null) {
      user.verification = {
        ...user.verification?.toObject?.(),
        licenseNumber: verification.licenseNumber,
      };
    }
  }

  await user.save();
  res.json({ user: user.toPublic() });
});
