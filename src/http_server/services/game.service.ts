import { Game, gameDb } from '../db/game.db';
import { AttackData, GameData, Ship } from '../types/interfaces';
import { ServerError } from '../utils/ServerError';
import { ERROR_GAME_NOT_CREATED, ERROR_GAME_NOT_STARTED, ERROR_GAME_PLAYER_NOT_IN_GAME, ERROR_GAME_WRONG_PLAYER } from '../utils/constants';
import { fillArray } from '../utils/fillArray';
import { AttackResult } from '../types/enums';

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

    const adaptedShips = ships.map((ship) => {
      return {
        ...ship,
        cull: fillArray(ship.length),
      };
    });

    const updatedPlayers = game.players.map((player) => {
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
      arePlayersReady: !updatedPlayers.find((item) => !item.populated),
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

  public beginTurn(gameId: string, playerId: string) {
    gameDb.update(gameId, {
      currentPlayer: playerId,
    });
    return { currentPlayer: playerId };
  }

  public performAttack({ gameId, x, y, indexPlayer }: AttackData) {
    const game = gameDb.getById(gameId);

    if (!game) {
      throw new ServerError(ERROR_GAME_NOT_CREATED);
    }

    if (!game.gameOn) {
      throw new ServerError(ERROR_GAME_NOT_STARTED);
    }

    const gamePlayer = game.players.find((player) => player.indexPlayer === indexPlayer);

    if (!gamePlayer) {
      throw new ServerError(ERROR_GAME_PLAYER_NOT_IN_GAME);
    }

    if (game.currentPlayer !== indexPlayer) {
      throw new ServerError(ERROR_GAME_WRONG_PLAYER);
    }

    const enemyPlayer = game.players.find((player) => player.indexPlayer !== indexPlayer)!;

    const { status, ships } = this.shootShips(x, y, enemyPlayer.ships);

    if (status !== AttackResult.MISS) {
      const updatedPlayers = game.players.map((player) => {
        if (player.indexPlayer === enemyPlayer.indexPlayer) {
          return {
            ...player,
            ships,
          };
        }

        return player;
      });

      gameDb.update(gameId, { players: updatedPlayers });
    }

    const playersIds = game.players.map((player) => player.indexPlayer);

    return {
      nextPlayer: status === AttackResult.MISS ? playersIds.find((id) => id !== indexPlayer)! : indexPlayer,
      playersIds,
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status,
      },
    };
  }

  private shootShips(shotX: number, shotY: number, ships: Ship[]) {
    let status: AttackResult = AttackResult.MISS;

    const shotShips = ships.reduce<Ship[]>((acc, ship) => {
      const { direction, cull, position } = ship;
      const [lengthPosition, widthPosition] = direction ? [position.y, position.x] : [position.x, position.y];
      const [lengthShot, widthShot] = direction ? [shotY, shotX] : [shotX, shotY];
      const lengthPositions = cull.map((item) => item + lengthPosition);

      if (widthShot !== widthPosition || !lengthPositions.includes(lengthShot)) {
        return [...acc, ship];
      }

      const index = lengthPositions.findIndex((position) => position === lengthShot);

      console.log(cull);

      const shotCull = [...cull.slice(0, index), ...cull.slice(index + 1)];

      console.log(shotCull);

      if (shotCull.length === 0) {
        status = AttackResult.KILLED;
        return acc;
      }

      status = AttackResult.SHOT;

      return [
        ...acc,
        {
          ...ship,
          cull: shotCull,
        },
      ];
    }, []);

    return {
      status,
      ships: shotShips,
    };
  }
}

export const gameService = new GameService();
