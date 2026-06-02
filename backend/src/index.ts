import express from 'express';
import cors from 'cors';
import { fleetService } from './fleetService';
import { startSimulation } from './simulation';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FleetOps Backend is running!' });
});

app.get('/api/robots', (req, res) => {
  res.json(fleetService.getAllRobots());
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  startSimulation();
});
