import { Server } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import {
  setIO,
  SocketEvents,
  emitToPassengers,
  emitToRide,
} from './registry.js';

/**
 * Initialise Socket.IO on top of the HTTP server.
 *
 * Authentication: clients pass their JWT in the handshake `auth.token`.
 * On connect we place the socket into the relevant rooms so controllers
 * can target users, drivers, passengers, or a specific ride.
 */
export function initSockets(httpServer, clientOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigins, credentials: true },
  });

  // ── Handshake authentication ──────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyToken(token);
      socket.user = { id: payload.sub, role: payload.role, name: payload.name };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    socket.join(`user:${id}`);
    socket.join(role === 'driver' ? 'drivers' : 'passengers');

    // Join a ride room to receive live updates for a specific ride.
    socket.on('ride:join', (rideId) => {
      if (rideId) socket.join(`ride:${rideId}`);
    });
    socket.on('ride:leave', (rideId) => {
      if (rideId) socket.leave(`ride:${rideId}`);
    });

    // Drivers stream their live GPS position; relay to passengers + ride room.
    socket.on('driver:location', async (loc) => {
      if (role !== 'driver' || !loc) return;
      const update = {
        driverId: id,
        lat: loc.lat,
        lng: loc.lng,
        at: new Date().toISOString(),
      };
      emitToPassengers(SocketEvents.DRIVER_LOCATION, update);
      if (loc.rideId) emitToRide(loc.rideId, SocketEvents.DRIVER_LOCATION, update);

      // Best-effort persistence (non-blocking).
      User.findByIdAndUpdate(id, {
        currentLocation: { lat: loc.lat, lng: loc.lng, updatedAt: new Date() },
      }).catch(() => {});
    });

    socket.on('disconnect', () => {});
  });

  setIO(io);
  console.log('⚡ Socket.IO real-time layer ready');
  return io;
}
