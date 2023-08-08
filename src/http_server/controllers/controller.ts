import { WebSocketServer } from 'ws';
import { MessageType, ServerMessageMode } from '../types/enums';
import { ArrangedMessage, Message, ExtWebSocket, DataArray } from '../types/interfaces';
import service from '../services/service';
import { ServerError } from '../utils/ServerError';

class Controller {
  private server: WebSocketServer;
  private ws: ExtWebSocket;

  constructor(server: WebSocketServer, ws: ExtWebSocket) {
    this.server = server;
    this.ws = ws;
  }

  public handleMessage({ type, data }: Message<string>) {
    try {
      let outgoingData;

      switch (type) {
        case MessageType.REGISTER: {
          outgoingData = service.handleRegister(JSON.parse(data), this.ws.id);
          break;
        }

        case MessageType.CREATE_ROOM: {
          outgoingData = service.handleCreateRoom(this.ws.id);
          break;
        }

        case MessageType.ADD_USER: {
          outgoingData = service.handleAddUser(JSON.parse(data), this.ws.id);
          break;
        }

        case MessageType.ADD_SHIPS: {
          outgoingData = service.handleAddShips(JSON.parse(data), this.ws.id);
          break;
        }

        case MessageType.ATTACK: {
          outgoingData = service.handleAttack(JSON.parse(data));
          break;
        }
      }

      if (outgoingData) {
        this.dispatchMessages(outgoingData);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  public handleClose() {
    service.handleClose(this.ws.id);
  }

  public handleError(error: Error) {
    if (error instanceof ServerError) {
      this.ws.send(this.generateOutgoingMessage(MessageType.ERROR, { errorText: error.message }));
    }

    console.log(error);
  }

  private dispatchMessages(outgoingData: ArrangedMessage[]) {
    outgoingData.forEach(({ mode, type, data, wsIds }) => {
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

        case ServerMessageMode.BROADCAST_SELECTIVE: {
          if (wsIds) {
            this.server.clients.forEach((client) => {
              if (wsIds.includes((client as ExtWebSocket).id)) {
                client.send(this.generateOutgoingMessage(type, data));
              }
            });
          }
          break;
        }

        case ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA: {
          if (wsIds) {
            this.server.clients.forEach((client) => {
              const clientId = (client as ExtWebSocket).id;
              if (wsIds.includes(clientId)) {
                client.send(this.generateOutgoingMessage(type, (data as DataArray).find((item) => item.id === clientId)!.data));
              }
            });
          }
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
