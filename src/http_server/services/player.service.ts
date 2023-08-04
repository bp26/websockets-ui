import { playerDb } from '../db/player.db';
import { PlayerData } from '../types/interfaces';

class PlayerService {
  public register({ name, password }: PlayerData, playerId: string) {
    const oldPlayer = playerDb.getByName(name);

    if (!oldPlayer) {
      playerDb.add(name, password, playerId);
    } else if (oldPlayer.password !== password) {
      return {
        error: true,
        errorText: 'Wrong password',
      };
    } else {
      playerDb.update(oldPlayer.id, {
        id: playerId,
        online: true,
      });
    }

    const player = playerDb.getById(playerId)!;

    return {
      ...{ name: player.name, index: player.id },
      error: false,
      errorText: '',
    };
  }

  public addGameIdToPlayer(playerId: string, gameId: string) {
    playerDb.update(playerId, {
      gameId,
    });
  }

  public getPlayer(id: string) {
    return playerDb.getById(id);
  }
}

export const playerService = new PlayerService();
