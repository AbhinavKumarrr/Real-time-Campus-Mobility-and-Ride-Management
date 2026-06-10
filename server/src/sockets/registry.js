/**
 * Holds the Socket.IO server instance and exposes typed emit helpers so
 * controllers can push real-time events without importing socket internals.
 *
 * Room conventions:
 *   user:<userId>   → a single user's private channel
 *   drivers         → all currently-connected drivers (ride broadcast)
 *   passengers      → all currently-connected passengers (availability feed)
 *   ride:<rideId>   → the passenger + driver bound to one ride
 */

let io = null;

export function setIO(instance) {
  io = instance;
}

export function getIO() {
  return io;
}

export const SocketEvents = {
  RIDE_NEW: 'ride:new', // → drivers: a new request is available
  RIDE_ASSIGNED: 'ride:assigned', // → passenger: a driver accepted
  RIDE_UPDATED: 'ride:updated', // → ride room: status/lifecycle change
  RIDE_CANCELLED: 'ride:cancelled', // → ride room
  RIDE_REQUEST_CLOSED: 'ride:requestClosed', // → drivers: request no longer available
  DRIVER_AVAILABILITY: 'driver:availability', // → passengers: online list changed
  DRIVER_LOCATION: 'driver:location', // → passengers / ride room: live position
};

export function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToDrivers(event, payload) {
  if (!io) return;
  io.to('drivers').emit(event, payload);
}

export function emitToPassengers(event, payload) {
  if (!io) return;
  io.to('passengers').emit(event, payload);
}

export function emitToRide(rideId, event, payload) {
  if (!io || !rideId) return;
  io.to(`ride:${rideId}`).emit(event, payload);
}
