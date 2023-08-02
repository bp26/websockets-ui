import { Game } from '../types/interfaces';
import { v4 } from 'uuid';

class GameDb {
  private games: Game[] = [];

  public addGame(playerId1: string, playerId2: string) {
    const player1 = {
      id: playerId1,
      ships: [],
    };
    const player2 = {
      id: playerId2,
      ships: [],
    };
    const game = {
      gameId: v4(),
      player1,
      player2,
    };
    this.games.push(game);
    return game;
  }
}

export const gameDb = new GameDb();
