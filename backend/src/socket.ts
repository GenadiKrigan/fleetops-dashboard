import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { fleetService } from './fleetService';

let io: SocketIOServer;

export function initializeSocket(server: HttpServer) {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Allows our Vite frontend to connect
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Immediately send the current state to the new client
        socket.emit('fleet:update', fleetService.getAllRobots());

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
}

// Helper to broadcast the latest robots to all clients
export function broadcastFleetUpdate() {
    if (io) {
        io.emit('fleet:update', fleetService.getAllRobots());
    }
}