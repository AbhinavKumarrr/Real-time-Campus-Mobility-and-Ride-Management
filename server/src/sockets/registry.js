let io = null;

export function setIO(instance) {
  io = instance;
}

export function getIO() {
  return io;
}

export const SocketEvents = {
  RIDE_NEW: 'ride:new',
  RIDE_ASSIGNED: 'ride:assigned', 
  RIDE_UPDATED: 'ride:updated',
  RIDE_CANCELLED: 'ride:cancelled',
  RIDE_REQUEST_CLOSED: 'ride:requestClosed',
  DRIVER_AVAILABILITY: 'driver:availability', 
  DRIVER_LOCATION: 'driver:location', 
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
