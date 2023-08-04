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

export class Game {
  gameId: string = v4();
  players: GamePlayer[];

  constructor(playerId1: string, playerId2: string) {
    this.players = [new GamePlayer(playerId1), new GamePlayer(playerId2)];
  }
}

class GameDb {
  private games: Game[] = [];

  public addGame(playerId1: string, playerId2: string) {
    const game = new Game(playerId1, playerId2);
    this.games.push(game);
    return game;
  }

  public updateGame(gameId: string, data: Partial<Game>) {
    const gameIndex = this.games.findIndex((item) => item.gameId === gameId);
    this.games[gameIndex] = {
      ...this.games[gameIndex],
      ...data,
    };
    return this.games[gameIndex];
  }

  public getGameById(gameId: string) {
    return this.games.find((item) => item.gameId === gameId);
  }

  public removeGame(gameId: string) {
    this.games.filter((room) => room.gameId !== gameId);
  }
}

export const gameDb = new GameDb();
