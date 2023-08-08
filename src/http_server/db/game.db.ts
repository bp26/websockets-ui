import { Db, DatabaseItem } from './db';
import { v4 } from 'uuid';
import { Ship } from '../types/interfaces';

class GamePlayer {
  indexPlayer: string;
  populated = false;
  ships: Ship[] = [];

  constructor(indexPlayer: string) {
    this.indexPlayer = indexPlayer;
  }
}

export class Game implements DatabaseItem {
  id: string = v4();
  gameOn = false;
  players: GamePlayer[];

  constructor(playerId1: string, playerId2: string) {
    this.players = [new GamePlayer(playerId1), new GamePlayer(playerId2)];
  }
}

export const gameDb = new Db<typeof Game, Game>(Game);
