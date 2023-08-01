import { WebSocketServer, WebSocket } from 'ws';
import { MessageType, ServerMessageMode } from '../types/enums';
import { ArrangedData, Message } from '../types/interfaces';
import Service from '../services/Service';

class Controller {
  private server: WebSocketServer;

  constructor(server: WebSocketServer) {
    this.server = server;
  }

  public handleMessage({ type, data }: Message<string>, ws: WebSocket) {
    switch (type) {
      case MessageType.REGISTER: {
        const outgoingData = Service.register(JSON.parse(data));
        this.dispatchMessages(ws, type, outgoingData);
        break;
      }

      case MessageType.UPDATE_ROOM: {
        break;
      }

      default:
        break;
    }
  }

  public handleClose() {}

  public handleError() {}

  private dispatchMessages(ws: WebSocket, type: string, outgoingData: ArrangedData[]) {
    outgoingData.forEach((arrangedData) => {
      switch (arrangedData.mode) {
        case ServerMessageMode.SEND: {
          ws.send(this.formatOutgoingMessage(type, arrangedData.data));
          break;
        }

        case ServerMessageMode.SEND: {
          this.server.clients.forEach((client) => {
            client.send(this.formatOutgoingMessage(type, arrangedData.data));
          });
          break;
        }
      }
    });
  }

  private formatOutgoingMessage(type: string, outgoingData: unknown) {
    return JSON.stringify({
      type,
      data: JSON.stringify(outgoingData),
      id: 0,
    });
  }
}

export default Controller;
