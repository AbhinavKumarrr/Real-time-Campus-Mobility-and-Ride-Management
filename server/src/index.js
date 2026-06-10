import http from 'http';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { initSockets } from './sockets/index.js';
import User from './models/User.js';
import { seedDatabase } from './seed/seedData.js';

async function start() {
  await connectDB();

  // With the ephemeral in-memory DB, auto-seed on startup so the app has
  // demo data without a separate `npm run seed` step.
  if (env.useMemoryDb) {
    const count = await User.estimatedDocumentCount();
    if (count === 0) {
      console.log('🌱 In-memory DB is empty — seeding demo data...');
      await seedDatabase({ log: (m) => console.log('   ' + m) });
      console.log('   Demo logins (password: password123): ananya@iitr.ac.in / suresh@iitr.ac.in');
    }
  }

  const app = createApp();
  const server = http.createServer(app);
  initSockets(server, env.clientOrigins);

  server.listen(env.port, () => {
    console.log(`🚀 Campus Ride API listening on http://localhost:${env.port}`);
    console.log(`🌐 Allowed client origins: ${env.clientOrigins.join(', ')}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
