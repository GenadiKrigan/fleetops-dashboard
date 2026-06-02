import express from 'express';
import cors from 'cors';
import http from 'http';
import { fleetService } from './fleetService';
import { startSimulation } from './simulation';
import { initializeSocket } from './socket';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
initializeSocket(server);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FleetOps Backend is running!' });
});

app.get('/api/robots', (req, res) => {
  res.json(fleetService.getAllRobots());
});

app.get('/api/queue', (req, res) => {
  res.json({
    queueLength: fleetService.missionQueue.length,
    queue: fleetService.missionQueue
  });
});

app.get('/api/missions', (req, res) => {
  res.json(Array.from(fleetService.missions.values()));
});


app.post('/api/robots/:robotId/cancel', (req, res) => {
  const { robotId } = req.params;
  fleetService.cancelMission(robotId);
  res.json({ success: true, message: `Mission cancelled for ${robotId}` });
});

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  startSimulation();
});
