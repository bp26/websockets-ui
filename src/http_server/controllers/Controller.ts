import { WebSocketServer, WebSocket } from 'ws';
import { MessageType, ServerMessageMode } from '../types/enums';
import { ArrangedData, Message, ExtWebSocket } from '../types/interfaces';
import Service from '../services/Service';

class Controller {
  private server: WebSocketServer;
  private ws: ExtWebSocket;

  constructor(server: WebSocketServer, ws: ExtWebSocket) {
    this.server = server;
    this.ws = ws;
  }

  public handleMessage({ type, data }: Message<string>) {
    switch (type) {
      case MessageType.REGISTER: {
        const outgoingData = Service.register(JSON.parse(data), this.ws.id);
        this.dispatchMessages(outgoingData);
        break;
      }

      case MessageType.CREATE_ROOM: {
        const outgoingData = Service.createRoom();
        this.dispatchMessages(outgoingData);
        break;
      }

      default:
        break;
    }
  }

  public handleClose() {}

  private dispatchMessages(outgoingData: ArrangedData[]) {
    outgoingData.forEach(({ mode, type, data }) => {
      switch (mode) {
        case ServerMessageMode.SEND: {
          this.ws.send(this.generateOutgoingMessage(type, data));
          break;
        }

        case ServerMessageMode.BROADCAST: {
          this.server.clients.forEach((client) => {
            client.send(this.generateOutgoingMessage(type, data));
          });
          break;
        }
      }
    });
  }

  private generateOutgoingMessage(type: MessageType, outgoingData: unknown) {
    return JSON.stringify({
      type,
      data: JSON.stringify(outgoingData),
      id: 0,
    });
  }
}

export default Controller;
