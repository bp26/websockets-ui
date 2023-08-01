import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Controller from './controllers/Controller';
import { v4 } from 'uuid';
import { ExtWebSocket } from './types/interfaces';

const server = createServer();

const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws: ExtWebSocket) => {
  const id = v4();
  ws.id = id;
  const controller = new Controller(wsServer, ws);

  ws.on('message', (msg) => {
    controller.handleMessage(JSON.parse(msg.toString()));
  });

  ws.on('close', () => {
    controller.handleClose();
  });
});

export default server;
