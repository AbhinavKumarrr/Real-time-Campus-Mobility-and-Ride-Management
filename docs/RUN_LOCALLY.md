# ▶️ How to Run CampusRide on Your Machine (and view it in Chrome)

Opening `client/dist/index.html` directly in Chrome **does not work** — that file is
only the frontend shell. The app needs three things running together:

```
Chrome (localhost:5173)  →  React dev server (:5173)  →  API + Socket.IO (:5000)  →  MongoDB
```

You start the two Node servers, then open **http://localhost:5173** in Chrome.

The only piece that needs setup is **MongoDB**. Pick **ONE** option below.

---

## Option A — Local MongoDB service (best if installed)

If MongoDB Community Server is installed as a Windows service, it listens on
`mongodb://127.0.0.1:27017` automatically.

1. Confirm the service is running (PowerShell):
   ```powershell
   Get-Service *mongo*        # Status should be "Running"
   ```
   If it exists but is stopped: `Start-Service MongoDB`

2. Set `server\.env`:
   ```
   USE_MEMORY_DB=false
   MONGO_URI=mongodb://127.0.0.1:27017/campus_ride
   ```

3. Seed demo data + run (from the project root `clt\`):
   ```powershell
   npm run seed      # loads demo drivers, passengers, rides
   npm run dev       # starts API :5000 + client :5173
   ```

4. Open **http://localhost:5173** in Chrome.

---

## Option B — MongoDB Atlas (cloud, free — guaranteed to work anywhere)

Use this if you can't run MongoDB locally (e.g. corporate machine restrictions).

1. Go to **https://www.mongodb.com/atlas** → sign up (free).
2. **Create a free M0 cluster** (any region).
3. **Database Access** → add a database user (username + password).
4. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`).
5. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Put it in `server\.env` (add the db name `campus_ride` before the `?`):
   ```
   USE_MEMORY_DB=false
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/campus_ride?retryWrites=true&w=majority
   ```
7. Seed + run (from project root):
   ```powershell
   npm run seed
   npm run dev
   ```
8. Open **http://localhost:5173** in Chrome.

---

## First time only — install dependencies

If you haven't already, from the project root `clt\`:
```powershell
npm install            # installs the root 'concurrently' helper
npm run install:all    # installs server + client dependencies
```

> If `node`/`npm` aren't recognised in a new terminal, close and reopen it (the
> installer added them to PATH), or open a fresh PowerShell window.

---

## Trying it out in Chrome (the fun part)

1. **Open two browser windows side by side** (or one normal + one Incognito):
   - Window 1 → log in as **passenger** `ananya@iitr.ac.in`
   - Window 2 → log in as **driver** `suresh@iitr.ac.in`
   - (password for all seeded accounts: `password123`)
2. **Driver window:** click **Go Online**.
3. **Passenger window:** pick pickup + destination → **Request ride**.
4. Watch the request **pop up instantly** in the driver window → click **Accept**.
5. See both windows update live: Accepted → Start → Complete.
6. Passenger → **My Rides** → rate the trip. Driver → **Dashboard** to see stats update.

That side-by-side, no-refresh sync is the real-time engine (Socket.IO) in action.

---

## Stopping the app
Press **Ctrl + C** in the terminal running `npm run dev`.
