import { WebSocket } from 'ws';

import { MessageType, ServerMessageMode, ShipType } from './enums';

export interface ExtWebSocket extends WebSocket {
  id: string;
}

export interface Message<T> {
  type: string;
  data: T;
  id: 0;
}

export interface ArrangedMessage {
  mode: ServerMessageMode;
  wsIds?: string[];
  data: unknown;
  type: MessageType;
}

export interface DataArray
  extends Array<{
    id: string;
    data: unknown;
  }> {}

export interface PlayerData {
  name: string;
  password: string;
}

export interface RoomData {
  indexRoom: string;
}

export interface ShipData {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface Ship extends ShipData {
  cull: number[];
}

export interface GameData {
  ships: ShipData[];
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface RandomAttackData {
  gameId: string;
  indexPlayer: string;
}

export interface AttackData extends RandomAttackData {
  x: number;
  y: number;
}
