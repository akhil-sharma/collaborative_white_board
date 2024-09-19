import express, { Request, Response } from 'express';
import * as path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {API_PORT} from "@collaborative-drawing-board/shared";
import { CanvasElement, CanvasEvents } from '@collaborative-drawing-board/shared';

const app = express();
app.use(cors())
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", credentials: false} });
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// TODO: Move to a database
const elements: Array<CanvasElement> = [];

// Sockets
io.on('connection', (clientSocket) => {
  console.log(`New client connected the server.`);
  clientSocket.emit(CanvasEvents.INITIALIZE_CANVAS, elements);

  clientSocket.on(CanvasEvents.UPDATE_CANVAS, (data: CanvasElement) => {
    elements.push(data);
    clientSocket.broadcast.emit(CanvasEvents.UPDATE_CANVAS, data);
  });

  clientSocket.on('disconnect', () => {
    console.log(`Client disconnected.`)
  });
});

// APIs
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});


httpServer.listen(API_PORT, () => {
  console.log(`Listening at http://localhost:${API_PORT}/api`);
});
