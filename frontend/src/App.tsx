import { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';

function App() {
  const [robots, setRobots] = useState<any[]>([]);

  useEffect(() => {
    // Listen for the fleet:update event
    socket.on('fleet:update', (updatedRobots) => {
      setRobots(updatedRobots);
    });

    // Cleanup listener on unmount
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
        <p>Dashboard table will go here...</p>
        {/* A simple counter to prove real-time data is flowing */}
        <p>Real-time robots tracked: <strong>{robots.length}</strong></p>
        <p>Active missions: <strong>{robots.filter(r => r.status !== 'idle').length}</strong></p>
      </main>
    </div>
  );
}

export default App;