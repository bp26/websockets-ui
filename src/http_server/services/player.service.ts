import { playerDb } from '../db/player.db';
import { PlayerData } from '../types/interfaces';
import { ERROR_PLAYER_ALREADY_ONLINE, ERROR_PLAYER_WRONG_PASSWORD } from '../utils/constants';

class PlayerService {
  public register({ name, password }: PlayerData, playerId: string) {
    let player = playerDb.getByName(name);

    if (!player) {
      player = playerDb.add(name, password, playerId);
    } else if (player.password !== password) {
      return {
        error: true,
        errorText: ERROR_PLAYER_WRONG_PASSWORD,
      };
    } else if (player.online) {
      return {
        error: true,
        errorText: ERROR_PLAYER_ALREADY_ONLINE,
      };
    } else {
      player = playerDb.update(player.id, {
        id: playerId,
        online: true,
      });
    }

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

  public addRoomIdToPlayer(playerId: string, roomId: string) {
    playerDb.update(playerId, {
      roomId,
    });
  }

  public logoffPlayer(playerId: string) {
    const player = playerDb.getById(playerId);

    if (player) {
      playerDb.update(playerId, {
        online: false,
        gameId: '',
        roomId: '',
      });
    }

    return { player };
  }

  public getPlayerById(id: string) {
    return playerDb.getById(id);
  }
}

export const playerService = new PlayerService();
