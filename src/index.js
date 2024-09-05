import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const ELEMENTS_STATE = [];

app.use(express.static(__dirname + '/../public'));
app.get("/", express.static(__dirname + '/../public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket}`);
    socket.emit('elements_init', ELEMENTS_STATE);
  
    // Handle receiving drawing data
    socket.on('canvas_update', (data) => {
      // Broadcast the drawing data to other clients
      socket.broadcast.emit('canvas_update', data);
      ELEMENTS_STATE.push(data);
    });

    // Handle deleting the element
    socket.on('element_delete', (index) => {
        socket.broadcast.emit('canvas_delete', index);
    });
  
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket}`);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
