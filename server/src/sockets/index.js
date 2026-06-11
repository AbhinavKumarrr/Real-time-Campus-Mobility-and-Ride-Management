import { Server } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import {
  setIO,
  SocketEvents,
  emitToPassengers,
  emitToRide,
} from './registry.js';

export function initSockets(httpServer, clientOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigins, credentials: true },
  });

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

    socket.on('ride:join', (rideId) => {
      if (rideId) socket.join(`ride:${rideId}`);
    });
    socket.on('ride:leave', (rideId) => {
      if (rideId) socket.leave(`ride:${rideId}`);
    });

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

      User.findByIdAndUpdate(id, {
        currentLocation: { lat: loc.lat, lng: loc.lng, updatedAt: new Date() },
      }).catch(() => {});
    });

    socket.on('disconnect', () => {});
  });

  setIO(io);
  console.log('Socket.IO real-time layer ready');
  return io;
}
