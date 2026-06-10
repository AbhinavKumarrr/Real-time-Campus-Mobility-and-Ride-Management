/**
 * CLI seed script — populates the database with demo passengers, drivers,
 * and a spread of historical rides + ratings.
 *
 *   npm run seed
 *
 * NOTE: This seeds the database pointed to by MONGO_URI. It is only useful
 * with a PERSISTENT database (local MongoDB or Atlas). When USE_MEMORY_DB=true
 * the server auto-seeds itself on startup instead (see src/index.js).
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

async function run() {
  await connectDB();
  console.log('🌱 Seeding database...');
  await seedDatabase({ log: (m) => console.log('   ' + m) });
  console.log('✅ Seed complete.');
  console.log('\n   Demo logins (password: password123):');
  console.log('   Passenger → ananya@iitr.ac.in');
  console.log('   Driver    → suresh@iitr.ac.in\n');
  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
