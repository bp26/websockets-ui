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

export interface Player {
  name: string;
  password: string;
}

export interface RegisteredPlayer extends Player {
  id: string;
}

export interface RoomIndex {
  indexRoom: string;
}

export interface Room {
  roomId: string;
  roomUsers: { name: string; index: string }[];
}

export interface Game {
  gameId: string;
  player1: GamePlayer;
  player2: GamePlayer;
}

export interface GamePlayer {
  id: string;
  ships: Ship[];
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface Winner {
  name: string;
  wins: number;
}
