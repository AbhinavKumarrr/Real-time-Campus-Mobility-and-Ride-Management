# 🛺 Real-Time Campus Mobility & Ride Management Platform

It is a full-stack real-time ride management platform that connects **passengers** with **e-rickshaw drivers** inside a campus environment. Passengers can request rides, drivers can accept and manage them, and both sides receive live status updates through **Socket.IO**.

It is designed around the last-mile transportation problem seen in large campuses such as IIT Roorkee, where ride coordination is often fragmented and informal.

---

## ✨ Project Overview

Campuses rely on informal, fragmented coordination between riders and drivers.
CampusRide centralises this into one digital system that handles the **complete ride
lifecycle** — discovery, request, assignment, live tracking, completion, and feedback —
with real-time synchronisation across every connected user.

### Highlights
- 🔐 **JWT authentication** with separate **passenger** and **driver** roles
- 🟢 **Driver availability** management (go online/offline, live status)
- 🚕 **Ride request workflow** with **atomic single-driver assignment** (no double-booking)
- ⚡ **Real-time updates** over Socket.IO — requests, assignments, status changes, live driver location
- 🔄 **Full ride lifecycle**: `Requested → Accepted → In Progress → Completed / Cancelled`
- 📊 **Driver dashboard** with summary cards, charts (earnings, ride volume, status mix) and history
- ⭐ **Ratings & feedback** with per-driver average rating
- 🗺️ **Live campus map** (Leaflet + OpenStreetMap) — *bonus*
- 📈 **Demand analytics** — peak hours, popular pickups, daily volume — *bonus*

---

## 🧰 Technology Stack

| Layer            | Technology                                              |
|------------------|---------------------------------------------------------|
| Frontend         | React 18 (Vite), React Router, Recharts, React-Leaflet  |
| Real-time client | socket.io-client                                        |
| Backend          | Node.js, Express                                        |
| Real-time server | Socket.IO                                               |
| Database         | MongoDB + Mongoose ODM                                  |
| Auth             | JSON Web Tokens (JWT), bcrypt password hashing          |
| Maps             | Leaflet + OpenStreetMap tiles                           |
| Dev DB (zero-setup) | `mongodb-memory-server` (in-memory MongoDB)          |

---

## 📁 Repository Structure

```
campus-ride-platform/
├── server/                  # Express + Socket.IO + MongoDB API
│   ├── src/
│   │   ├── config/          # env + DB connection
│   │   ├── models/          # User, Ride, Rating (Mongoose schemas)
│   │   ├── controllers/     # auth, driver, ride, rating, analytics
│   │   ├── routes/          # REST route definitions
│   │   ├── middleware/      # auth (JWT), error handling
│   │   ├── sockets/         # Socket.IO setup + emit registry
│   │   ├── seed/            # demo data seeding
│   │   └── index.js         # entry point (HTTP + sockets)
│   └── package.json
├── client/                  # React (Vite) single-page app
│   ├── src/
│   │   ├── context/         # Auth, Socket, Toast providers
│   │   ├── components/      # Navbar, Map, charts, badges, etc.
│   │   ├── pages/           # passenger/ , driver/ , auth, analytics
│   │   └── lib/             # api client, socket client, constants
│   └── package.json
├── docs/                    # Design document, ERD, demo video script
└── package.json             # root convenience scripts
```

---

## 🚀 Clone, Install & Run Locally

### Prerequisites

Before running the project, ensure the following are installed:

* Node.js (v18 or later)
* npm
* Git

MongoDB installation is optional because the project supports an in-memory database for quick setup and testing.

---

## 1. Clone the Repository

```bash
git clone https://github.com/AbhinavKumarrr/Real-time-Campus-Mobility-and-Ride-Management.git
cd Real-time-Campus-Mobility-and-Ride-Management
```

---

## 2. Install Dependencies

### Backend Dependencies

```bash
cd server
npm install
```

### Frontend Dependencies

Open a new terminal and run:

```bash
cd client
npm install
```

---

## 3. Configure Environment Variables

Create `.env` files using the provided examples.

### Backend

```bash
cp server/.env.example server/.env
```

### Frontend

```bash
cp client/.env.example client/.env
```

Default values provided in the example files are sufficient for local development.

---

## 4. Start the Backend Server

From the `server` directory:

```bash
npm run dev
```

Backend will start on:

```text
http://localhost:5000
```

---

## 5. Start the Frontend Application

Open another terminal and navigate to the `client` directory:

```bash
npm run dev
```

Frontend will start on:

```text
http://localhost:5173
```

---

## 6. Open the Application

Visit:

```text
http://localhost:5173
```

The CampusRide application should now be running locally.

---

## 🔑 Demo Accounts

The application includes seeded demo accounts for quick testing.

### Passenger Account

| Email                                         | Password    |
| --------------------------------------------- | ----------- |
| [ananya@iitr.ac.in](mailto:ananya@iitr.ac.in) | password123 |

### Driver Accounts

| Email                                         | Password    |
| --------------------------------------------- | ----------- |
| [suresh@iitr.ac.in](mailto:suresh@iitr.ac.in) | password123 |
| [mahesh@iitr.ac.in](mailto:mahesh@iitr.ac.in) | password123 |

You may also create new Passenger or Driver accounts using the Sign Up page.

---

## 🧪 Testing the Workflow

### Passenger Flow

1. Login as Passenger
2. Request a Ride
3. Select Pickup Location
4. Select Destination
5. Submit Ride Request
6. Track Ride Status in Real Time
7. Complete Ride
8. Submit Rating and Feedback

### Driver Flow

1. Login as Driver
2. Set Availability to Online
3. View Incoming Ride Requests
4. Accept a Ride Request
5. Start Ride
6. Complete Ride
7. View Updated Statistics on Dashboard

---

## 📡 Local Development Ports

| Service          | URL                   |
| ---------------- | --------------------- |
| Frontend         | http://localhost:5173 |
| Backend API      | http://localhost:5000 |
| Socket.IO Server | http://localhost:5000 |

Once both services are running, all ride requests, driver updates, ride lifecycle changes, analytics, and notifications will synchronize in real time through Socket.IO.


---

## 🧭 Feature List

- ✅ **User Authentication & Profiles** — passenger & driver registration/login (JWT), driver vehicle + verification info, profile updates
- ✅ **Driver Availability** — go online/offline; passengers see available drivers before requesting
- ✅ **Ride Request Workflow** — request with pickup/destination; drivers view, accept, or reject; **one ride → one driver** (atomic)
- ✅ **Real-Time Ride Updates** — Socket.IO live status, availability, assignment notifications, live driver location
- ✅ **Ride Lifecycle** — Requested → Accepted → In Progress → Completed → Cancelled, kept consistent across clients
- ✅ **Driver Dashboard** — total/active/completed rides, earnings, ratings, charts, full ride history
- ✅ **Ratings & Feedback** — passengers rate completed rides; driver averages + feedback history
- ✅ **Live Map Integration** (Leaflet + OpenStreetMap) — pickup, destination & driver markers, route line
- ✅ **Demand Analytics** — peak demand hours, popular pickup locations, daily ride volume

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint                     | Auth        | Description                            |
|--------|------------------------------|-------------|----------------------------------------|
| POST   | `/auth/register`             | —           | Register (passenger or driver)         |
| POST   | `/auth/login`                | —           | Login, returns JWT                     |
| GET    | `/auth/me`                   | any         | Current user                           |
| PATCH  | `/auth/profile`              | any         | Update profile / vehicle               |
| GET    | `/drivers/available`         | any         | List online & available drivers        |
| PATCH  | `/drivers/availability`      | driver      | Go online/offline                      |
| PATCH  | `/drivers/location`          | driver      | Update live location                   |
| POST   | `/rides`                     | passenger   | Request a ride                         |
| GET    | `/rides`                     | any         | My rides (passenger or driver)         |
| GET    | `/rides/requests`            | driver      | Open requests to accept                |
| GET    | `/rides/:id`                 | participant | Ride detail                            |
| PATCH  | `/rides/:id/accept`          | driver      | Accept (atomic single assignment)      |
| PATCH  | `/rides/:id/reject`          | driver      | Reject / hide request                  |
| PATCH  | `/rides/:id/start`           | driver      | Start ride (→ in_progress)             |
| PATCH  | `/rides/:id/complete`        | driver      | Complete ride                          |
| PATCH  | `/rides/:id/cancel`          | participant | Cancel ride                            |
| POST   | `/ratings`                   | passenger   | Rate a completed ride                  |
| GET    | `/ratings/driver/:id`        | any         | Driver feedback history                |
| GET    | `/analytics/driver`          | driver      | Driver dashboard metrics               |
| GET    | `/analytics/demand`          | any         | Campus demand analytics (bonus)        |

### Real-time events (Socket.IO)
`ride:new` · `ride:assigned` · `ride:updated` · `ride:cancelled` · `ride:requestClosed`
· `driver:availability` · `driver:location`

---

## 🧪 Notes on Reproducibility
- The app runs end-to-end with **no external services** thanks to the in-memory DB option.
- Deterministic seed data ensures dashboards and analytics look identical on every fresh run.
- All configuration is via `.env`; nothing is hard-coded.

---

## Author
Abhinav Kumar

---
