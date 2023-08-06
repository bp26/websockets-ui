import { gameDb } from '../db/game.db';
import { GameData } from '../types/interfaces';
import { Game } from '../db/game.db';
import { ServerError } from '../utils/ServerError';
import { ERROR_GAME_NOT_CREATED } from '../utils/constants';

class GameService {
  public createGame(playerId1: string, playerId2: string) {
    const { id } = gameDb.add(playerId1, playerId2);
    const data = [
      {
        id: playerId1,
        data: {
          idGame: id,
          idPlayer: playerId1,
        },
      },
      {
        id: playerId2,
        data: {
          idGame: id,
          idPlayer: playerId2,
        },
      },
    ];
    return { data, id };
  }

  public addShips({ ships }: GameData, playerId: string, gameId: string) {
    const game = gameDb.getById(gameId);

    if (!game) {
      throw new ServerError(ERROR_GAME_NOT_CREATED);
    }

    const { players } = game;

    const updatedPlayers = players.map((player) => {
      if (player.indexPlayer === playerId) {
        return {
          ...player,
          populated: true,
          ships,
        };
      } else {
        return player;
      }
    });

    const updatedGame = gameDb.update(gameId, { players: updatedPlayers });

    return {
      arePlayersReady: !updatedPlayers.find((item) => item.populated === false),
      playersIds: updatedPlayers.map((player) => player.indexPlayer),
      gameData: updatedGame,
    };
  }

  public startGame({ players }: Game) {
    return players.map((player) => {
      return {
        id: player.indexPlayer,
        data: {
          ships: player.ships,
          currentPlayerIndex: player.indexPlayer,
        },
      };
    });
  }

  public beginTurn(playerId: string) {
    return { currentPlayer: playerId };
  }
}

export const gameService = new GameService();
