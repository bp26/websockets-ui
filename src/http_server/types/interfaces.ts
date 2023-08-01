import { ServerMessageMode } from './enums';

export interface Message<T> {
  type: string;
  data: T;
  id: 0;
}

export interface ArrangedData {
  mode: ServerMessageMode;
  data: unknown;
}

export interface Player {
  name: string;
  password: string;
}

export interface RegisterAnswer {
  name?: string;
  index?: number;
  error: boolean;
  errorText: string;
}

export interface Room {
  roomId: number;
  roomUsers: { name: string; index: number }[];
}
