import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Controller from './controllers/Controller';

const server = createServer();

const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws) => {
  const controller = new Controller(wsServer);

  ws.on('message', (msg) => {
    controller.handleMessage(JSON.parse(msg.toString()), ws);
  });

  ws.on('close', () => {
    controller.handleClose();
  });

  ws.on('error', () => {
    controller.handleError();
  });
});

export default server;
