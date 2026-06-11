import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import { unauthorized, forbidden } from '../utils/http.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(unauthorized('Missing authentication token'));

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return next(unauthorized('User no longer exists'));

    req.user = user;
    next();
  } catch (err) {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(forbidden(`This action is restricted to ${role}s`));
    }
    next();
  };
}
