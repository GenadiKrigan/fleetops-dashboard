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
* **assigned:** 10 seconds 
* **en_route:** 20 seconds
* **delivering:** 15 seconds
* **completed:** 5 seconds (After 5 seconds, the mission finishes and the robot is freed).

## 7. Assumptions and Tradeoffs
* **Time Scale:** The 60-second generation interval paired with the 50-second total lifecycle means the system can easily handle the load without the queue overflowing, assuming no outside interference. 
* **Cancellation Safety:** I assumed that canceling a mission completely frees the robot for immediate reassignment. In a real-world scenario, a robot might need a "returning to base" state after a cancellation before it can take a new mission.
* **WebSocket Efficiency:** Instead of the frontend constantly polling the backend for updates, Socket.IO is used to push updates only when a state transition actually occurs, drastically reducing network overhead.

## 8. In-Memory Storage
Per the assignment requirements, this system runs entirely in memory. All data is stored using native JavaScript data structures (`Map` for fast robot/mission lookups, `Set` to track idle IDs, and an `Array` for the queue). No external database, filesystem persistence, or cloud storage is utilized.

## 9. Frontend Status Colors
The dashboard utilizes color-coded badges to represent the robot's current status. This is purely a UI enhancement to help the operations team quickly identify states at a glance without having to read text.
* **Gray (IDLE):** Neutral/Available 
* **Blue (ASSIGNED):** Newly assigned task 
* **Yellow (EN ROUTE):** Indicating movement 
* **Orange (DELIVERING):** Actively at the drop-off 
* **Green (COMPLETED):** Successful delivery 

---

## 10. AWS Architecture Plan (Production Readiness)
If this application were to be deployed to a real AWS production environment, the in-memory limitations would be removed in favor of the following highly scalable architecture:

* **Frontend Hosting:** The React application would be built into static assets, stored in an **Amazon S3** bucket, and distributed globally via **Amazon CloudFront** for low latency.
* **Backend Compute:** The Node.js application would be Dockerized and pushed to **Amazon ECR** (Elastic Container Registry). It would be run on **Amazon ECS (Elastic Container Service) with Fargate** for serverless, autoscaling container management.
* **Persistent Storage:** The in-memory Maps and Sets would be replaced by **Amazon DynamoDB**, a NoSQL database ideal for fast, high-volume state tracking and mission queuing. 
* **Real-time Updates:** To maintain WebSocket connections at scale, we would use an **Application Load Balancer (ALB)** configured for WebSockets in front of our ECS tasks, or utilize **Amazon API Gateway WebSocket APIs**.
* **Monitoring & Observability:** All container logs, state transitions, and system health metrics would be routed to **Amazon CloudWatch** to trigger alerts if robot error rates spike.
* **Infrastructure as Code (IaC):** The entire stack would be defined, version-controlled, and deployed using the **AWS Cloud Development Kit (CDK)** with TypeScript.