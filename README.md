# 🛺 CampusRide — Real-Time Campus Mobility & Ride Management Platform

A full-stack platform that connects **passengers** with **e-rickshaw drivers** on a
campus in real time. Passengers request rides, drivers accept and fulfil them, and
both sides see live status updates powered by **WebSockets (Socket.IO)** — modelled
on the last-mile transportation problem at large campuses such as IIT Roorkee.

> Built for the **Cult Open Projects 2027 — Software Development** problem statement.

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

## 🚀 Setup Instructions

### Prerequisites
- **Node.js ≥ 18** ([nodejs.org](https://nodejs.org))
- **MongoDB** — *optional*. By default the server runs an **in-memory MongoDB**, so
  you can run the whole app with **zero database setup**. For persistence, install
  MongoDB locally or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Clone & install
```bash
git clone <your-repo-url> campus-ride-platform
cd campus-ride-platform

# Install both server and client dependencies
npm run install:all
# (equivalent to: cd server && npm install  &&  cd ../client && npm install)
```

### 2. Configure environment
Copy the example env files (defaults work out of the box):
```bash
# Windows (PowerShell)
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env

# macOS / Linux
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server (`server/.env`)** — key settings:
| Variable        | Default                                | Notes                                   |
|-----------------|----------------------------------------|-----------------------------------------|
| `PORT`          | `5000`                                 | API port                                |
| `USE_MEMORY_DB` | `true`                                 | `true` = zero-setup in-memory MongoDB   |
| `MONGO_URI`     | `mongodb://127.0.0.1:27017/campus_ride`| used when `USE_MEMORY_DB=false`         |
| `JWT_SECRET`    | *(set a long random string)*           | token signing secret                    |
| `CLIENT_ORIGIN` | `http://localhost:5173`                | allowed CORS / Socket.IO origin         |

**Client (`client/.env`)**:
```
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Running the Application

### Option A — one command (recommended)
From the project root:
```bash
npm install          # installs the root 'concurrently' helper (once)
npm run dev          # starts server (:5000) and client (:5173) together
```

### Option B — two terminals
```bash
# Terminal 1 — API + real-time server
cd server
npm run dev

# Terminal 2 — React app
cd client
npm run dev
```

Then open **http://localhost:5173**.

> **Demo data:** When `USE_MEMORY_DB=true`, the server **auto-seeds** demo passengers,
> drivers and historical rides on first start. With a **persistent** database, run the
> seed manually: `npm run seed` (from root) or `cd server && npm run seed`.

### 🔑 Demo accounts (password: `password123`)
| Role      | Email                |
|-----------|----------------------|
| Passenger | `ananya@iitr.ac.in`  |
| Driver    | `suresh@iitr.ac.in`  |
| Driver    | `mahesh@iitr.ac.in`  |

*(Or register your own passenger/driver accounts from the sign-up page.)*

---

## 🧭 Feature List

### Mandatory
- ✅ **User Authentication & Profiles** — passenger & driver registration/login (JWT), driver vehicle + verification info, profile updates
- ✅ **Driver Availability** — go online/offline; passengers see available drivers before requesting
- ✅ **Ride Request Workflow** — request with pickup/destination; drivers view, accept, or reject; **one ride → one driver** (atomic)
- ✅ **Real-Time Ride Updates** — Socket.IO live status, availability, assignment notifications, live driver location
- ✅ **Ride Lifecycle** — Requested → Accepted → In Progress → Completed → Cancelled, kept consistent across clients
- ✅ **Driver Dashboard** — total/active/completed rides, earnings, ratings, charts, full ride history
- ✅ **Ratings & Feedback** — passengers rate completed rides; driver averages + feedback history

### Bonus
- ⭐ **Live Map Integration** (Leaflet + OpenStreetMap) — pickup, destination & driver markers, route line
- ⭐ **Demand Analytics** — peak demand hours, popular pickup locations, daily ride volume

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

See [`docs/DESIGN_DOCUMENT.md`](docs/DESIGN_DOCUMENT.md) for architecture, schema, ERD and design decisions.

---

## 🧪 Notes on Reproducibility
- The app runs end-to-end with **no external services** thanks to the in-memory DB option.
- Deterministic seed data ensures dashboards and analytics look identical on every fresh run.
- All configuration is via `.env`; nothing is hard-coded.

---

## 📜 License
Released for academic evaluation under the MIT License. See [LICENSE](LICENSE).
