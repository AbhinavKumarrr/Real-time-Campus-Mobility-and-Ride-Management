import mongoose from 'mongoose';
import env from './env.js';

let memoryServer = null;

/**
 * Connect to MongoDB. If USE_MEMORY_DB=true, spin up an in-memory MongoDB
 * instance (mongodb-memory-server) so the app can run with zero external
 * setup — ideal for quick demos and evaluation.
 */
export async function connectDB() {
  let uri = env.mongoUri;

  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('🧪 Using in-memory MongoDB (data is not persisted).');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`🗄️  MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
