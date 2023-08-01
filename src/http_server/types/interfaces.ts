import { WebSocket } from 'ws';

import { MessageType, ServerMessageMode } from './enums';

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

export interface Room {
  roomId: string;
  roomUsers: { name: string; index: string }[];
}

export interface Winner {
  name: string;
  wins: number;
}
