import { io } from 'socket.io-client';
import { API_URL } from './api.js';

let socket = null;

/**
 * Lazily create (or reuse) a single authenticated Socket.IO connection.
 */
export function getSocket(token) {
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
