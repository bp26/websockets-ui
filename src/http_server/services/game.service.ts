import { gameDb } from '../db/game.db';

class GameService {
  public createGame(playerId1: string, playerId2: string) {
    const { gameId: idGame } = gameDb.addGame(playerId1, playerId2);
    return [
      {
        id: playerId1,
        data: {
          idGame,
          idPlayer: playerId1,
        },
      },
      {
        id: playerId2,
        data: {
          idGame,
          idPlayer: playerId2,
        },
      },
    ];
  }
}

export const gameService = new GameService();
