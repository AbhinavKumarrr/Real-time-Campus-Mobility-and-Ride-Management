import { createApp } from '../app.js';
import './../models/User.js';
import './../models/Ride.js';
import './../models/Rating.js';
import '../controllers/auth.controller.js';
import '../controllers/driver.controller.js';
import '../controllers/ride.controller.js';
import '../controllers/rating.controller.js';
import '../controllers/analytics.controller.js';
import '../routes/index.js';
import '../sockets/index.js';
import { seedDatabase } from '../seed/seedData.js';

const app = createApp();
const routes = [];
app._router.stack.forEach((m) => {
  if (m.route) routes.push(Object.keys(m.route.methods).join(',') + ' ' + m.route.path);
});

console.log('✅ All backend modules imported successfully.');
console.log('   Express app constructed:', typeof app === 'function');
console.log('   seedDatabase is a function:', typeof seedDatabase === 'function');
process.exit(0);
