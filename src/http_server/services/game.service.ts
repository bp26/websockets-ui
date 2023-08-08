import { gameDb } from '../db/game.db';
import { AttackData, GameData, Ship } from '../types/interfaces';
import { Game } from '../db/game.db';
import { ServerError } from '../utils/ServerError';
import { ERROR_GAME_NOT_CREATED } from '../utils/constants';
import { fillArray } from '../utils/fillArray';

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

    const adaptedShips = ships.map((ship) => {
      return {
        ...ship,
        cull: fillArray(ship.length),
      };
    });

    const updatedPlayers = players.map((player) => {
      if (player.indexPlayer === playerId && !player.populated) {
        return {
          ...player,
          populated: true,
          ships: adaptedShips,
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

  public startGame({ players, id }: Game) {
    gameDb.update(id, {
      gameOn: true,
    });

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

  public performAttack({ gameId, x, y, indexPlayer }: AttackData) {
    const game = gameDb.getById(gameId);

    if (!game) {
      throw new ServerError(ERROR_GAME_NOT_CREATED);
    }

    const gamePlayer = game.players.find((player) => player.indexPlayer === indexPlayer);

    if (!gamePlayer) {
      throw new ServerError(`This player isn't in this game`);
    }
  }

  private shootShip(x: number, y: number, ships: Ship[]) {
    const shotShip = ships.find((ship) => {
      const starter = ship.direction ? x : y;
      const positions = ship.cull.map((value) => value + starter);
    });
  }
}

export const gameService = new GameService();
