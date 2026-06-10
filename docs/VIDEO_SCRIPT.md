# 🎬 CampusRide — Demonstration Video Script & Storyboard

**Target length: ≤ 3:00 minutes.** The video must show: User Registration & Login,
Ride Request Workflow, Ride Assignment, Real-Time Updates, Driver Dashboard, and
Ratings & Feedback.

## Setup before recording
1. Start the app: `npm run dev` (server :5000 + client :5173).
2. Open **two browser windows side by side** (or one normal + one incognito):
   - **Left = Passenger** · **Right = Driver**
   - This makes the *real-time* behaviour obvious — the key evaluation criterion.
3. Have demo accounts ready (password `password123`):
   - Passenger `ananya@iitr.ac.in` · Driver `suresh@iitr.ac.in`
4. Use screen recording at 1080p; enable cursor highlight if available.

---

## Shot-by-shot script

### 0:00–0:15 · Intro & Login *(Registration & Login)*
- **Voiceover:** "CampusRide is a real-time ride management platform for campus
  e-rickshaws. Let's see it in action."
- Show the landing page briefly.
- **Left window:** quickly register OR log in as a **passenger** (`ananya@iitr.ac.in`).
- **Right window:** log in as a **driver** (`suresh@iitr.ac.in`).
- Point out the **"Live"** connection badge in the navbar (Socket.IO connected).

### 0:15–0:35 · Driver goes online *(Availability)*
- **Right (Driver):** click **"Go Online"**, pick a current location.
- **Voiceover:** "The driver goes online and becomes available."
- **Left (Passenger):** show the driver appearing in **"Available drivers"** and on the
  map — *highlight this updated without a refresh* (real-time availability feed).

### 0:35–1:05 · Request a ride *(Ride Request Workflow + Map)*
- **Left (Passenger):** select **pickup** and **destination**, click **Request ride**.
- Show the ride card switch to **"Requested"** with the lifecycle stepper and the
  route drawn on the map (pickup 🟢 → destination 🔴).
- **Voiceover:** "The passenger requests a ride; it's instantly broadcast to drivers."

### 1:05–1:30 · Assignment *(Ride Assignment + Real-Time)*
- **Right (Driver):** the new request **pops up instantly** under "Incoming requests"
  with a toast — *no refresh*. Click **Accept**.
- **Left (Passenger):** the card **immediately** updates to **"Accepted"**, shows the
  assigned driver's name, vehicle and rating, with a toast "Driver assigned!".
- **Voiceover:** "Acceptance is atomic — only one driver can take a ride. Both sides
  update live over WebSockets."

### 1:30–1:55 · Ride lifecycle *(Lifecycle Management)*
- **Right (Driver):** click **Start ride** → both windows show **"In Progress"**.
- Then click **Complete ride** → both show **"Completed"**.
- **Voiceover:** "The ride moves through its lifecycle — accepted, in progress,
  completed — kept perfectly in sync."

### 1:55–2:20 · Ratings & Feedback *(Ratings)*
- **Left (Passenger):** go to **My Rides**, give the completed ride **5 stars** + a
  short comment, click **Submit**.
- **Voiceover:** "Passengers rate completed rides and leave feedback."

### 2:20–2:50 · Driver Dashboard + Analytics *(Dashboard + Bonus)*
- **Right (Driver):** open **Dashboard** — point to summary cards (total rides,
  earnings, rating), the **charts** (rides/earnings over time, status breakdown), the
  **recent feedback** (the rating just submitted), and the **ride history** table.
- Briefly open **Demand** analytics — peak hours, popular pickups, daily volume.
- **Voiceover:** "Drivers get rich insights, and operators can analyse campus demand."

### 2:50–3:00 · Close
- **Voiceover:** "CampusRide — reliable, real-time campus mobility, built on the MERN
  stack with Socket.IO. Thank you."
- End on the landing page or a title card.

---

## Tips for a strong submission
- **Show the two windows side-by-side during assignment & lifecycle** — this is the
  single most convincing proof of real-time sync (20% of the score).
- Keep narration tight; don't read the UI aloud, explain *what's happening underneath*.
- If you exceed 3:00, cut the registration step (just log in) and the Demand analytics.
- Record at a calm pace; pause ~1s after each real-time update so viewers see it land.
