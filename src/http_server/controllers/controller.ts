import { WebSocketServer } from 'ws';
import { MessageType, ServerMessageMode } from '../types/enums';
import { ArrangedMessage, Message, ExtWebSocket, DataArray } from '../types/interfaces';
import Service from '../services/service';

class Controller {
  private server: WebSocketServer;
  private ws: ExtWebSocket;

  constructor(server: WebSocketServer, ws: ExtWebSocket) {
    this.server = server;
    this.ws = ws;
  }

  public handleMessage({ type, data }: Message<string>) {
    try {
      switch (type) {
        case MessageType.REGISTER: {
          const outgoingData = Service.handleRegister(JSON.parse(data), this.ws.id);
          this.dispatchMessages(outgoingData);
          break;
        }

        case MessageType.CREATE_ROOM: {
          const outgoingData = Service.handleCreateRoom(this.ws.id);
          this.dispatchMessages(outgoingData);
          break;
        }

        case MessageType.ADD_USER: {
          const outgoingData = Service.handleAddUser(JSON.parse(data), this.ws.id);
          this.dispatchMessages(outgoingData);
          break;
        }

        case MessageType.ADD_SHIPS: {
          const outgoingData = Service.handleAddShips(JSON.parse(data), this.ws.id);
          this.dispatchMessages(outgoingData);
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public handleClose() {}

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
                client.send(
                  this.generateOutgoingMessage(
                    type,
                    (data as DataArray).find((item) => item.id === clientId)
                  )
                );
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
