import { useEffect, useState } from 'react';
import { socket } from './socket';
import { type Robot } from './types';
import { RobotTable } from './RobotTable';
import './App.css';

function App() {
  const [robots, setRobots] = useState<Robot[]>([]);

  useEffect(() => {
    //Fetch initial state so the page isn't blank on load
    fetch('http://localhost:3001/api/robots')
      .then((res) => res.json())
      .then((data) => setRobots(data))
      .catch((err) => console.error("Failed to fetch initial robots:", err));

    //Listen for the real-time socket updates
    socket.on('fleet:update', (updatedRobots: Robot[]) => {
      setRobots(updatedRobots);
    });

    // Cleanup
    return () => {
      socket.off('fleet:update');
    };
  }, []);

  return (
    <div className="App">
      <header>
        <h1>FleetOps Dashboard</h1>
      </header>
      <main>
        <div className="stats-bar">
          <p>Real-time robots tracked: <strong>{robots.length}</strong></p>
          <p>Active missions: <strong>{robots.filter(r => r.status !== 'idle').length}</strong></p>
        </div>

        {/* Render our new table component */}
        <RobotTable robots={robots} />
      </main>
    </div>
  );
}

export default App;