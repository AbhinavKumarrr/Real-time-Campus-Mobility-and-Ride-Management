import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

async function run() {
  await connectDB();
  console.log('Seeding database...');
  await seedDatabase({ log: (m) => console.log('   ' + m) });
  console.log('Seed complete.');
  console.log('\n   Demo logins (password: password123):');
  console.log('   Passenger → abhinav@iitr.ac.in');
  console.log('   Driver    → suresh@iitr.ac.in\n');
  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
