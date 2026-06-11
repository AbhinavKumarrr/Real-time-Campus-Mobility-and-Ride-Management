import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Rating from '../models/Rating.js';
import { haversineKm, estimateFare } from '../utils/geo.js';

const PLACES = {
  mainGate: { label: 'Main Gate', lat: 29.8649, lng: 77.8965 },
  lecHall: { label: 'Lecture Hall Complex', lat: 29.865, lng: 77.8967 },
  library: { label: 'Mahatma Gandhi Central Library', lat: 29.8662, lng: 77.8951 },
  rajendra: { label: 'Rajendra Bhawan', lat: 29.8688, lng: 77.8939 },
  cautley: { label: 'Cautley Bhawan', lat: 29.8675, lng: 77.8983 },
  azad: { label: 'Azad Bhawan', lat: 29.8702, lng: 77.8961 },
  tinkering: { label: 'Tinkering Lab', lat: 29.864, lng: 77.894 },
  sac: { label: 'Student Activity Centre', lat: 29.8669, lng: 77.8995 },
};
const PLACE_LIST = Object.values(PLACES);

const pick = (arr, i) => arr[i % arr.length];

function prng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function seedDatabase({ log = () => {} } = {}) {
  await Promise.all([User.deleteMany({}), Ride.deleteMany({}), Rating.deleteMany({})]);

  const password = 'password123';

  // Default Passengers
  const passengerData = [
    { name: 'Ananya Sharma', email: 'ananya@iitr.ac.in' },
    { name: 'Rahul Verma', email: 'rahul@iitr.ac.in' },
    { name: 'Priya Nair', email: 'priya@iitr.ac.in' },
  ];
  const passengers = [];
  for (const p of passengerData) {
    const u = new User({ ...p, role: 'passenger', phone: '90000' + (10000 + passengers.length) });
    await u.setPassword(password);
    await u.save();
    passengers.push(u);
  }

  // Default Drivers
  const driverData = [
    { name: 'Suresh Kumar', email: 'suresh@iitr.ac.in', plate: 'UK07 1234', color: 'Green' },
    { name: 'Mahesh Singh', email: 'mahesh@iitr.ac.in', plate: 'UK07 5678', color: 'Yellow' },
    { name: 'Vikram Yadav', email: 'vikram@iitr.ac.in', plate: 'UK07 9012', color: 'Blue' },
  ];
  const drivers = [];
  for (let i = 0; i < driverData.length; i++) {
    const d = driverData[i];
    const u = new User({
      name: d.name,
      email: d.email,
      role: 'driver',
      phone: '95000' + (10000 + i),
      vehicle: { type: 'e-rickshaw', model: 'Mahindra Treo', plateNumber: d.plate, color: d.color, capacity: 3 },
      verification: { licenseNumber: 'DL-UK-' + (100000 + i), verified: true },
      isOnline: i < 2,
      availabilityStatus: i < 2 ? 'available' : 'offline',
      currentLocation: { ...pick(PLACE_LIST, i), updatedAt: new Date() },
    });
    await u.setPassword(password);
    await u.save();
    drivers.push(u);
  }

  // Historical rides
  const rand = prng(42);
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const rides = [];

  for (let i = 0; i < 60; i++) {
    const passenger = pick(passengers, i);
    const driver = pick(drivers, i + 1);
    const pickup = pick(PLACE_LIST, Math.floor(rand() * PLACE_LIST.length));
    let destination = pick(PLACE_LIST, Math.floor(rand() * PLACE_LIST.length));
    if (destination.label === pickup.label) destination = pick(PLACE_LIST, i + 3);

    const daysAgo = Math.floor(rand() * 7);
    const hour = Math.floor(rand() * 24);
    const requestedAt = new Date(now - daysAgo * DAY - hour * 60 * 60 * 1000);

    const distanceKm = Number(haversineKm(pickup, destination).toFixed(2));
    const fare = estimateFare(distanceKm);
    const roll = rand();
    const status = roll < 0.88 ? 'completed' : 'cancelled';

    const ride = new Ride({
      passenger: passenger._id,
      driver: driver._id,
      pickup,
      destination,
      distanceKm,
      fare,
      status,
      requestedAt,
      acceptedAt: new Date(requestedAt.getTime() + 2 * 60 * 1000),
      startedAt: status !== 'cancelled' ? new Date(requestedAt.getTime() + 4 * 60 * 1000) : null,
      completedAt: status === 'completed' ? new Date(requestedAt.getTime() + 15 * 60 * 1000) : null,
      cancelledAt: status === 'cancelled' ? new Date(requestedAt.getTime() + 3 * 60 * 1000) : null,
      cancelledBy: status === 'cancelled' ? 'passenger' : null,
      rated: false,
    });
    await ride.save();
    rides.push(ride);
  }

  // Feedbacks
  const feedbacks = [
    'Smooth and quick ride!',
    'Driver was very polite.',
    'On time, comfortable.',
    'Great service.',
    'Could be a bit faster but good overall.',
    '',
  ];
  const driverStars = {};
  let r = 0;
  for (const ride of rides) {
    if (ride.status !== 'completed') continue;
    if (rand() > 0.7) continue;
    const stars = 3 + Math.floor(rand() * 3);
    await Rating.create({
      ride: ride._id,
      passenger: ride.passenger,
      driver: ride.driver,
      stars,
      feedback: pick(feedbacks, r++),
    });
    ride.rated = true;
    await ride.save();
    (driverStars[ride.driver] ||= []).push(stars);
  }

  for (const d of drivers) {
    const arr = driverStars[d._id] || [];
    if (arr.length) {
      d.ratingAvg = Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
      d.ratingCount = arr.length;
      await d.save();
    }
  }

  log(`Seeded ${passengers.length} passengers, ${drivers.length} drivers, ${rides.length} rides.`);
  return { passengers: passengers.length, drivers: drivers.length, rides: rides.length };
}
