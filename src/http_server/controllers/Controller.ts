import { WebSocketServer, WebSocket } from 'ws';
import { MessageType } from '../types/enums';
import { Message } from '../types/interfaces';
import Service from '../services/Service';

class Controller {
  private server: WebSocketServer;

  constructor(server: WebSocketServer) {
    this.server = server;
  }

  public handleMessage({ type, data }: Message<string>, ws: WebSocket) {
    switch (type) {
      case MessageType.REGISTER: {
        const playerData = Service.register(JSON.parse(data));
        ws.send(
          JSON.stringify({
            type,
            data: playerData,
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
