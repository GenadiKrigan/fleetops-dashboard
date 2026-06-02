# FleetOps Dashboard Simulation

## 1. Project Overview
This project is a lightweight internal tool for operations teams to monitor and manage autonomous delivery robots. It features a simulated backend that manages the state of 100 robots in memory, alongside a real-time frontend dashboard to observe robot states and intervene by canceling active missions.

## 2. Technology Stack
* **Frontend:** React + Vite + TypeScript
* **Backend:** Node.js + Express + TypeScript
* **Real-time Updates:** Socket.IO

## 3. Setup Instructions
To run this project locally, you will need two terminal windows (one for the backend and one for the frontend).

**Backend Setup:**
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
*(The backend runs on http://localhost:3001)*

**Frontend Setup:**
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
*(The frontend runs on http://localhost:5173)*

## 4. Simulation Logic
When the backend server starts, it initializes exactly 100 robots in an `idle` state. Every 60 seconds, an automated simulator generates 2 new missions. 
* If there is an idle robot available, the mission is immediately assigned to it.
* If all 100 robots are busy, the mission is placed into a waiting queue (`queued`). 
* When a robot finishes a mission (or if a mission is cancelled), it instantly checks the queue. If a mission is waiting, the robot takes it immediately; otherwise, it returns to the `idle` pool.

## 5. Mission Lifecycle and State Transitions
Once assigned, a mission progresses through the following state machine automatically:
`queued` -> `assigned` -> `en_route` -> `delivering` -> `completed` -> `idle` (Robot state)

## 6. Timing Choices
The state transitions are governed by `setTimeout` timers with the following intervals:
* **assigned (10s):** Represents the brief time needed to dispatch the task to the robot.
* **en_route (20s):** The longest phase, mimicking real-world travel time.
* **delivering (15s):** A medium-length phase representing the actual package handoff.
* **completed (5s):** A short pause so the operator can clearly see the success state on the dashboard before the robot is freed.

## 7. Assumptions and Tradeoffs
* **Time Scale & Demo Pacing:** The 60-second generation interval paired with the 50-second total lifecycle means the system can easily handle the load without the queue overflowing, and it also creates a deliberate 10-second visual gap. This gives the reviewer time to clearly see the robots fully transition from `completed` back to `idle` before the next batch of missions is dispatched.
* **Cancellation Safety:** I assumed that canceling a mission completely frees the robot for immediate reassignment. In a real-world scenario, a robot might need a "returning to base" state after a cancellation before it can take a new mission.
* **WebSocket Efficiency:** Instead of the frontend constantly polling the backend for updates, Socket.IO is used to push updates only when a state transition actually occurs, drastically reducing network overhead.

## 8. In-Memory Storage
Per the assignment requirements, this system runs entirely in memory. All data is stored strictly in-memory within the Node.js server using a standard `Map` for fast robot/mission lookups, a `Set` to track idle IDs, and an `Array` for the queue. This keeps the application lightweight, though it means the robot and mission states will naturally reset whenever the server restarts.

## 9. Frontend Status Colors
The dashboard utilizes color-coded badges to represent the robot's current status. This is purely a UI enhancement to help the operations team quickly identify states at a glance without having to read text.
* **Gray (IDLE):** Neutral/Available 
* **Blue (ASSIGNED):** Newly assigned task 
* **Yellow (EN ROUTE):** Indicating movement 
* **Orange (DELIVERING):** Actively at the drop-off 
* **Green (COMPLETED):** Successful delivery 

---

## 10. AWS Architecture Plan (Production Readiness)
If I had to implement this system in a real AWS environment, here is how I would design the architecture: 

* **Frontend Hosting:** I would host the built React application in an **Amazon S3** bucket. Since Vite compiles the frontend into static files, S3 is a cheap and highly reliable place to serve them from.
* **Backend Compute (Dockerized):** I would wrap the Node.js Express server in a **Docker container**. This ensures the backend runs exactly the same in production as it does locally. I would then host this container on a basic **Amazon EC2** instance (or a managed service like AWS App Runner) to keep the deployment straightforward and maintainable.
* **Database / Storage:** To replace the local in-memory `Map` and `Set`, I would use a cloud database like **Amazon DynamoDB** or **Amazon ElastiCache** (Redis). These are extremely fast at key-value lookups, which perfectly mimics how our system tracks robot states and queues missions.