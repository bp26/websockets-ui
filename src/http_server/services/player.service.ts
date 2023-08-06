import { playerDb } from '../db/player.db';
import { PlayerData } from '../types/interfaces';
import { ERROR_PLAYER_ALREADY_ONLINE, ERROR_PLAYER_WRONG_PASSWORD } from '../utils/constants';

class PlayerService {
  public register({ name, password }: PlayerData, playerId: string) {
    const oldPlayer = playerDb.getByName(name);

    if (!oldPlayer) {
      playerDb.add(name, password, playerId);
    } else if (oldPlayer.password !== password) {
      return {
        error: true,
        errorText: ERROR_PLAYER_WRONG_PASSWORD,
      };
    } else if (oldPlayer.online) {
      return {
        error: true,
        errorText: ERROR_PLAYER_ALREADY_ONLINE,
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

  public logoffPlayer(playerId: string) {
    const player = playerDb.getById(playerId);

    if (player) {
      playerDb.update(playerId, {
        online: false,
        gameId: '',
      });
    }
  }

  public getPlayerById(id: string) {
    return playerDb.getById(id);
  }
}

export const playerService = new PlayerService();
