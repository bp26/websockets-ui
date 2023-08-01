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

export interface ArrangedData {
  mode: ServerMessageMode;
  wsId?: string[];
  data: unknown;
  type: MessageType;
}

export interface Player {
  name: string;
  password: string;
}

export interface RegisteredPlayer extends Player {
  id: string;
}

export interface RoomIndex {
  roomId: string;
}

export interface Room extends RoomIndex {
  roomUsers: { name: string; index: string }[];
}

export interface Game {
  gameId: string;
  playerOne: GamePlayer;
  playerTwo: GamePlayer;
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
