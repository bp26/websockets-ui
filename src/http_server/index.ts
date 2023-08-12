import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Controller from './controllers/controller';
import { v4 } from 'uuid';
import { ExtWebSocket } from './types/interfaces';

const server = createServer();

const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws: ExtWebSocket) => {
  ws.id = v4();
  const controller = new Controller(wsServer, ws);

  ws.on('message', (msg) => {
    controller.handleMessage(JSON.parse(msg.toString()));
  });

  ws.on('close', () => {
    controller.handleClose();
  });

  ws.on('error', (error: Error) => {
    controller.handleError(error);
  });
});

export default server;
