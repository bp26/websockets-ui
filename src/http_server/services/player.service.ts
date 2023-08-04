import { playerDb } from '../db/player.db';
import { PlayerData } from '../types/interfaces';

class PlayerService {
  public register({ name, password }: PlayerData, playerId: string) {
    const oldPlayer = playerDb.getPlayerByName(name);

    if (!oldPlayer) {
      playerDb.addPlayer({ name, password, id: playerId });
    } else if (oldPlayer.password !== password) {
      return {
        error: true,
        errorText: 'Wrong password',
      };
    } else {
      playerDb.updatePlayer(oldPlayer.playerId, {
        playerId,
        online: true,
      });
    }

    const player = playerDb.getPlayerById(playerId)!;

    return {
      ...{ name: player.name, index: player.playerId },
      error: false,
      errorText: '',
    };
  }

  public addGameIdToPlayer(playerId: string, gameId: string) {
    playerDb.updatePlayer(playerId, {
      gameId,
    });
  }

  public getPlayer(id: string) {
    return playerDb.getPlayerById(id);
  }

  public getWinners() {
    return playerDb.getWinners();
  }
}

export const playerService = new PlayerService();
