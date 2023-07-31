import { WebSocketServer, WebSocket } from 'ws';
import { MessageType } from '../types/enums';
import { Message, Player } from '../types/interfaces';
import Service from '../services/Service';

class Controller {
  private server: WebSocketServer;

  constructor(server: WebSocketServer) {
    this.server = server;
  }
  public handleMessage({ type, data }: Message<unknown>, ws: WebSocket) {
    switch (type) {
      case MessageType.REGISTER: {
        const message = Service.register(data as Player);
        ws.send(
          JSON.stringify({
            type,
            data: message,
            id: 0,
          })
        );
        break;
      }

      case MessageType.UPDATE_ROOM:
        break;
      default:
        break;
    }
  }

  public handleClose() {}

  public handleError() {}

  private broadcast(msg: Message<unknown>) {
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify(msg));
    });
  }
}

export default Controller;
