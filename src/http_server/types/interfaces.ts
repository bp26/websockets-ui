export interface Message<T> {
  type: string;
  data: T;
  id: 0;
}

export interface Player {
  name: string;
  password: string;
}

export interface PlayerAnswer {
  name: string;
  index?: number;
  error: boolean;
  errorText: string;
}
