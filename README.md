# FleetOps Dashboard Simulation

## 1. Project Overview
[cite_start]This project is a lightweight internal tool for operations teams to monitor and manage autonomous delivery robots[cite: 3, 4]. [cite_start]It features a simulated backend that manages the state of 100 robots in memory [cite: 8, 24][cite_start], alongside a real-time frontend dashboard to observe robot states and intervene by canceling active missions[cite: 13, 17].

## 2. Technology Stack
* [cite_start]**Frontend:** React + Vite + TypeScript [cite: 71]
* [cite_start]**Backend:** Node.js + Express + TypeScript [cite: 71]
* [cite_start]**Real-time Updates:** Socket.IO [cite: 71]

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
[cite_start]When the backend server starts, it initializes exactly 100 robots in an `idle` state[cite: 20, 72]. [cite_start]Every 60 seconds, an automated simulator generates 2 new missions[cite: 21, 76]. 
* [cite_start]If there is an idle robot available, the mission is immediately assigned to it[cite: 78, 79].
* [cite_start]If all 100 robots are busy, the mission is placed into a waiting queue (`queued`)[cite: 81, 82]. 
* When a robot finishes a mission (or if a mission is cancelled), it instantly checks the queue. [cite_start]If a mission is waiting, the robot takes it immediately; otherwise, it returns to the `idle` pool[cite: 84, 85, 91].

## 5. Mission Lifecycle and State Transitions
[cite_start]Once assigned, a mission progresses through the following state machine automatically[cite: 47]:
[cite_start]`queued` -> `assigned` -> `en_route` -> `delivering` -> `completed` -> `idle` (Robot state) [cite: 76]

## 6. Timing Choices
[cite_start]The state transitions are governed by `setTimeout` timers with the following intervals[cite: 76]:
* **assigned:** 10 seconds 
* **en_route:** 20 seconds
* **delivering:** 15 seconds
* **completed:** 5 seconds (After 5 seconds, the mission finishes and the robot is freed).

## 7. Assumptions and Tradeoffs
* **Time Scale:** The 60-second generation interval paired with the 50-second total lifecycle means the system can easily handle the load without the queue overflowing, assuming no outside interference. 
* [cite_start]**Cancellation Safety:** I assumed that canceling a mission completely frees the robot for immediate reassignment[cite: 144]. In a real-world scenario, a robot might need a "returning to base" state after a cancellation before it can take a new mission.
* [cite_start]**WebSocket Efficiency:** Instead of the frontend constantly polling the backend for updates, Socket.IO is used to push updates only when a state transition actually occurs, drastically reducing network overhead[cite: 94].

## 8. In-Memory Storage
[cite_start]Per the assignment requirements, this system runs entirely in memory[cite: 9, 31]. [cite_start]All data is stored using native JavaScript data structures (`Map` for fast robot/mission lookups, `Set` to track idle IDs, and an `Array` for the queue)[cite: 71]. [cite_start]No external database, filesystem persistence, or cloud storage is utilized[cite: 31, 32].

## 9. Frontend Status Colors
[cite_start]The dashboard utilizes color-coded badges to represent the robot's current status[cite: 101]. [cite_start]This is purely a UI enhancement to help the operations team quickly identify states at a glance without having to read text[cite: 102].
* [cite_start]**Gray (IDLE):** Neutral/Available [cite: 107]
* **Blue (ASSIGNED):** Newly assigned task [cite: 108]
* [cite_start]**Yellow (EN ROUTE):** Indicating movement [cite: 108]
* [cite_start]**Orange (DELIVERING):** Actively at the drop-off [cite: 109]
* **Green (COMPLETED):** Successful delivery [cite: 109]

---

## 10. AWS Architecture Plan (Production Readiness)
[cite_start]If this application were to be deployed to a real AWS production environment [cite: 155][cite_start], the in-memory limitations would be removed in favor of the following highly scalable architecture[cite: 34, 35]:

* **Frontend Hosting:** The React application would be built into static assets, stored in an **Amazon S3** bucket, and distributed globally via **Amazon CloudFront** for low latency.
* **Backend Compute:** The Node.js application would be Dockerized and pushed to **Amazon ECR** (Elastic Container Registry). It would be run on **Amazon ECS (Elastic Container Service) with Fargate** for serverless, autoscaling container management.
* **Persistent Storage:** The in-memory Maps and Sets would be replaced by **Amazon DynamoDB**, a NoSQL database ideal for fast, high-volume state tracking and mission queuing. 
* **Real-time Updates:** To maintain WebSocket connections at scale, we would use an **Application Load Balancer (ALB)** configured for WebSockets in front of our ECS tasks, or utilize **Amazon API Gateway WebSocket APIs**.
* **Monitoring & Observability:** All container logs, state transitions, and system health metrics would be routed to **Amazon CloudWatch** to trigger alerts if robot error rates spike.
* **Infrastructure as Code (IaC):** The entire stack would be defined, version-controlled, and deployed using the **AWS Cloud Development Kit (CDK)** with TypeScript.