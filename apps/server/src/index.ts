import express, {Request, Response} from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CanvasElement } from '../../../shared/canvasTypes';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {cors: {origin: '*'}});

const elements: Array<CanvasElement> = [];

io.on('connection', (client) => {
    console.log(`new client connected to the server.`);
    client.emit('initialize_canvas', elements);
    
    client.on('canvas_update', (data: CanvasElement) => {
        elements.push(data);
        client.broadcast.emit('canvas_update', data);
    });

    client.on('disconnect', () => {
        `Client disconnected.`;
    });
});

// REST paths
app.get('/api', (request: Request, response: Response) => {
    return response.send(`OK`);
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}.`)
});