import { playerDb } from '../db/player.db';
import { Player } from '../types/interfaces';

class PlayerService {
  public register({ name, password }: Player, playerId: string) {
    try {
      const user = playerDb.addPlayer({ name, password, id: playerId });
      return {
        ...user,
        error: false,
        errorText: '',
      };
    } catch (error) {
      return {
        error: true,
        errorText: (error as Error).message,
      };
    }
  }

  public getPlayer(id: string) {
    return playerDb.getPlayerById(id);
  }

  public getWinners() {
    return playerDb.getWinners();
  }
}

export const playerService = new PlayerService();
