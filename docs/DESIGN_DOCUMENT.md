# CampusRide — Design Document

**Real-Time Campus Mobility & Ride Management Platform**
Cult Open Projects 2027 · Software Development

---

## 1. Problem Understanding

Large campuses such as IIT Roorkee depend on e-rickshaws for last-mile transport,
but ride requests and driver availability are coordinated informally. This leads to
inefficient resource use, delays, uneven demand distribution, and a poor experience
for both riders and drivers.

**Goal:** a centralized, real-time platform where passengers and drivers connect to
**discover, request, assign, track, and complete** rides reliably within a campus.

The core engineering challenges this mirrors from production ride-hailing systems are:

- **Real-time communication** — both sides must see state changes instantly.
- **Consistent ride state** — a ride must follow one well-defined lifecycle and a
  request must be assigned to **exactly one** driver (no double-booking).
- **Multi-user coordination** — many passengers and drivers act concurrently.
- **Geospatial handling** — pickup/destination/driver positions on a map.
- **Insight** — drivers and operators need dashboards and demand analytics.

### Scope delivered
All seven mandatory features (auth, availability, request workflow, real-time
updates, lifecycle, driver dashboard, ratings) plus two bonus features
(**live map** and **demand analytics**). Optional payments, scheduling and ML
forecasting were deliberately left out to keep the core workflow reliable, in line
with the guideline *"a reliable ride management system is preferable to numerous
incomplete features."*

---

## 2. System Architecture

CampusRide is a **three-tier MERN application** with a dedicated real-time channel.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT  (React + Vite)                        │
│   Passenger UI · Driver UI · Dashboard · Map (Leaflet) · Charts       │
│            ▲                                   ▲                       │
│       REST │ (Axios + JWT)            WebSocket │ (socket.io-client)   │
└────────────┼───────────────────────────────────┼─────────────────────┘
             │                                   │
┌────────────▼───────────────────────────────────▼─────────────────────┐
│                     SERVER  (Node.js + Express)                       │
│  Routes → Controllers → Services       Socket.IO (rooms + auth)       │
│  Middleware: JWT auth, role guard, error handling                     │
│  Emit registry bridges REST actions → real-time events                │
└────────────────────────────────┬──────────────────────────────────────┘
                                  │  Mongoose ODM
                       ┌──────────▼───────────┐
                       │   MongoDB  (Atlas /   │
                       │   local / in-memory)  │
                       │  Users · Rides ·      │
                       │  Ratings              │
                       └───────────────────────┘
```

### Request vs. real-time split
- **REST** is the source of truth for all state mutations (request, accept, start,
  complete, cancel, rate). Each endpoint validates, persists, then **emits** the
  resulting state.
- **Socket.IO** is used purely to *push* those changes to the relevant clients. It is
  never the sole authority, which keeps state consistent even if a socket drops.

### Socket room model
| Room              | Members                     | Used for                              |
|-------------------|-----------------------------|---------------------------------------|
| `user:<id>`       | one user                    | personal notifications                |
| `drivers`         | all connected drivers       | broadcasting new ride requests        |
| `passengers`      | all connected passengers    | driver availability / location feed   |
| `ride:<rideId>`   | the ride's passenger+driver | per-ride lifecycle updates            |

Sockets authenticate with the same JWT during the handshake, so every event is
scoped to an identified, authorised user.

### Ride lifecycle (state machine)
```
            request                accept              start             complete
 (none) ───────────► requested ───────────► accepted ──────► in_progress ──────► completed
                          │                     │                  │
                          └─────────────────────┴──────────────────┘
                                       cancel (passenger/driver)
                                              ▼
                                          cancelled
```
Transitions are guarded server-side: a ride can only move along the allowed edges,
and only by an authorised participant.

---

## 3. Database Schema

MongoDB (document model) via Mongoose. Three collections.

### `users`
| Field                 | Type      | Notes                                            |
|-----------------------|-----------|--------------------------------------------------|
| `_id`                 | ObjectId  | PK                                               |
| `name`                | String    | required                                         |
| `email`               | String    | required, **unique**, lowercased                 |
| `phone`               | String    |                                                  |
| `passwordHash`        | String    | bcrypt; `select:false` (never returned)          |
| `role`                | String    | `passenger` \| `driver`                          |
| `vehicle`             | Object    | *(driver)* type, model, plateNumber, color, capacity |
| `verification`        | Object    | *(driver)* licenseNumber, verified               |
| `isOnline`            | Boolean   | *(driver)* availability switch                   |
| `availabilityStatus`  | String    | `available` \| `busy` \| `offline`               |
| `currentLocation`     | Object    | lat, lng, label, updatedAt                       |
| `ratingAvg`           | Number    | *(driver)* aggregate rating                      |
| `ratingCount`         | Number    | *(driver)* number of ratings                     |
| `createdAt/updatedAt` | Date      | timestamps                                       |

### `rides`
| Field            | Type            | Notes                                                  |
|------------------|-----------------|--------------------------------------------------------|
| `_id`            | ObjectId        | PK                                                     |
| `passenger`      | ObjectId → users| required, indexed                                      |
| `driver`         | ObjectId → users| nullable until accepted, indexed                       |
| `pickup`         | Point           | { label, lat, lng }                                    |
| `destination`    | Point           | { label, lat, lng }                                    |
| `status`         | String          | requested/accepted/in_progress/completed/cancelled     |
| `distanceKm`     | Number          | computed (haversine)                                   |
| `fare`           | Number          | computed (base + per-km)                               |
| `rejectedBy`     | [ObjectId]      | drivers who declined (won't be re-offered)             |
| `requestedAt` … `cancelledAt` | Date | lifecycle timestamps                                  |
| `cancelledBy`    | String          | `passenger` \| `driver`                                |
| `rated`          | Boolean         | guards one rating per ride                             |

### `ratings`
| Field        | Type             | Notes                          |
|--------------|------------------|--------------------------------|
| `_id`        | ObjectId         | PK                             |
| `ride`       | ObjectId → rides | **unique** (one rating/ride)   |
| `passenger`  | ObjectId → users | author                         |
| `driver`     | ObjectId → users | subject, indexed               |
| `stars`      | Number           | 1–5                            |
| `feedback`   | String           | optional                       |

**Indexes:** `users.email` (unique), `rides.passenger`, `rides.driver`,
`rides.status + createdAt`, `ratings.ride` (unique), `ratings.driver`.

---

## 4. Entity Relationship Diagram (ERD)

```
        ┌───────────────────────┐
        │         USER          │
        │───────────────────────│
        │ PK _id                │
        │    name, email, phone │
        │    role               │
        │    vehicle (driver)   │
        │    isOnline, status   │
        │    ratingAvg, count   │
        └──────────┬────────────┘
          1        │        1
   passenger ┌─────┴──────┐ driver
             │            │
        places│           │fulfils
       (1..*) ▼           ▼ (0..*)
        ┌───────────────────────┐
        │         RIDE          │
        │───────────────────────│
        │ PK _id                │
        │ FK passenger ─────────┼──► USER
        │ FK driver ────────────┼──► USER (nullable)
        │    pickup, destination│
        │    status, distance,  │
        │    fare, timestamps   │
        └──────────┬────────────┘
                 1 │  receives
                   │  (0..1)
                   ▼
        ┌───────────────────────┐
        │        RATING         │
        │───────────────────────│
        │ PK _id                │
        │ FK ride (unique) ─────┼──► RIDE
        │ FK passenger ─────────┼──► USER
        │ FK driver ────────────┼──► USER
        │    stars (1-5)        │
        │    feedback           │
        └───────────────────────┘
```

**Relationships**
- A **User (passenger)** *places* many **Rides** (1‑to‑many).
- A **User (driver)** *fulfils* many **Rides** (1‑to‑many; a ride has 0‑or‑1 driver).
- A **Ride** *receives* 0‑or‑1 **Rating**.
- A **Rating** references the ride, its passenger (author) and driver (subject).

---

## 5. API Overview

Base URL `/api`. JSON over HTTP; JWT bearer auth; real-time via Socket.IO.

**Auth** — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/profile`
**Drivers** — `GET /drivers/available`, `PATCH /drivers/availability`, `PATCH /drivers/location`
**Rides** — `POST /rides`, `GET /rides`, `GET /rides/requests`, `GET /rides/:id`,
`PATCH /rides/:id/{accept|reject|start|complete|cancel}`
**Ratings** — `POST /ratings`, `GET /ratings/driver/:id`
**Analytics** — `GET /analytics/driver`, `GET /analytics/demand`

**Real-time events:** `ride:new`, `ride:assigned`, `ride:updated`, `ride:cancelled`,
`ride:requestClosed`, `driver:availability`, `driver:location`.

*Example — atomic accept:*
```
PATCH /api/rides/:id/accept        (driver)
→ findOneAndUpdate({ _id, status:'requested', driver:null },
                   { driver, status:'accepted' })
→ emit ride:assigned (passenger) + ride:requestClosed (drivers)
```

---

## 6. Design Decisions

1. **REST for truth, sockets for push.** All mutations go through validated REST
   endpoints; Socket.IO only broadcasts results. This avoids race conditions and keeps
   the system consistent even when a websocket reconnects.

2. **Atomic single-driver assignment.** Acceptance uses a single conditional
   `findOneAndUpdate` (`status:'requested', driver:null`). MongoDB guarantees only one
   concurrent driver can win — the rest get a clear *"already taken"* response. This
   directly satisfies *"a ride can only be assigned to a single driver."*

3. **Server-guarded state machine.** Lifecycle transitions are validated on the server
   (allowed edges + participant/role checks), so the UI can never push a ride into an
   invalid state.

4. **Room-scoped events.** Emitting to `user:`, `ride:`, `drivers`, `passengers` rooms
   means each client receives only the events relevant to it — efficient and scalable.

5. **JWT + role middleware.** Stateless auth scales horizontally; `requireRole`
   centralises authorisation. Passwords are bcrypt-hashed and never serialized.

6. **Zero-setup developer experience.** An in-memory MongoDB option with auto-seeding
   lets evaluators run the full stack with only Node installed, while a real
   `MONGO_URI` is a one-line switch for persistence — aiding reproducibility.

7. **Computed fare/distance.** Haversine distance and a transparent base+per-km fare
   keep estimates deterministic and explainable, without a paid routing API.

8. **Scalability path.** Stateless API instances behind a load balancer; Socket.IO can
   scale across nodes with a Redis adapter; MongoDB indexes on the hot query paths
   (status, driver, passenger) keep reads fast as data grows.

### Trade-offs & future work
- Driver↔request matching is **broadcast-to-all-online** (simple, transparent) rather
  than proximity-ranked dispatch — a geo-nearest assignment is the natural next step.
- Payments, ride scheduling and ML demand **forecasting** are scoped out but the schema
  (timestamps, locations) already supports adding them.
```
