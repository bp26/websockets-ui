import { Game, gameDb, GamePlayer } from '../db/game.db';
import { AttackData, Coordinates, GameData, Ship } from '../types/interfaces';
import { ServerError } from '../utils/ServerError';
import {
  ERROR_GAME_NOT_CREATED,
  ERROR_GAME_NOT_STARTED,
  ERROR_GAME_PLAYER_NOT_IN_GAME,
  ERROR_GAME_SHIPS_ALREADY_ADDED,
  ERROR_GAME_WRONG_PLAYER,
  FIELD_MAX_COUNT,
  FIELD_MIN_COUNT,
  UNEXPECTED_ERROR_ENEMY_DOESNT_EXIST,
  UNEXPECTED_ERROR_GAME_DOESNT_EXIST,
} from '../utils/constants';
import { fillArray } from '../utils/fillArray';
import { AttackResult } from '../types/enums';
import { generateNumber } from '../utils/generateNumber';

class GameService {
  public createGame(playerId1: string, playerId2: string) {
    const { id: gameId } = gameDb.add(playerId1, playerId2);
    const data = [playerId1, playerId2].map((id) => {
      return {
        id: id,
        data: {
          idGame: gameId,
          idPlayer: id,
        },
      };
    });
    return { data, gameId };
  }

  public addShips({ ships }: GameData, playerId: string, gameId: string) {
    const game = gameDb.getById(gameId);

    if (!game) {
      throw new ServerError(ERROR_GAME_NOT_CREATED);
    }

    const gamePlayer = game.players.find((player) => player.indexPlayer === playerId);

    if (!gamePlayer) {
      throw new ServerError(ERROR_GAME_PLAYER_NOT_IN_GAME);
    }

    if (gamePlayer.populated) {
      throw new ServerError(ERROR_GAME_SHIPS_ALREADY_ADDED);
    }

    const adaptedShips = ships.map((ship) => {
      return {
        ...ship,
        cull: fillArray(ship.length),
      };
    });

    const updatedGame = this.updatePlayer(playerId, gameId, {
      populated: true,
      ships: adaptedShips,
    });

    return {
      arePlayersReady: !updatedGame.players.find((item) => !item.populated),
      playersIds: updatedGame.players.map((player) => player.indexPlayer),
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

    const enemyPlayer = game.players.find((player) => player.indexPlayer !== indexPlayer);

    if (!enemyPlayer) {
      throw Error(UNEXPECTED_ERROR_ENEMY_DOESNT_EXIST);
    }

    const { status, ships, killedShipCoordinates } = this.shootShips(x, y, enemyPlayer.ships);

    if (status !== AttackResult.MISS) {
      this.updatePlayer(enemyPlayer.indexPlayer, gameId, {
        ships,
      });
    }

    const killedShipData = killedShipCoordinates?.map((position) => this.formAttackResponse(position, indexPlayer, status));
    const shotData = this.formAttackResponse({ x, y }, indexPlayer, status);

    const playersIds = game.players.map((player) => player.indexPlayer);
    const nextPlayer = status === AttackResult.MISS ? playersIds.find((id) => id !== indexPlayer)! : indexPlayer;

    const areShipsEmpty = ships.length === 0;

    return {
      status,
      nextPlayer,
      playersIds,
      shotData,
      killedShipData,
      areShipsEmpty,
    };
  }

  public finishGame(gameId: string, playerId: string) {
    gameDb.remove(gameId);
    return { winPlayer: playerId };
  }

  public getEnemyId(gameId: string, playerId: string) {
    const game = gameDb.getById(gameId);
    if (game) {
      return game.players.find((player) => player.indexPlayer !== playerId)?.indexPlayer;
    }
  }

  public generateRandomCoordinates() {
    const [min, max] = [FIELD_MIN_COUNT, FIELD_MAX_COUNT];
    const [x, y] = [generateNumber(min, max), generateNumber(min, max)];

    return {
      x,
      y,
    };
  }

  private shootShips(shotX: number, shotY: number, ships: Ship[]) {
    let status: AttackResult | undefined;
    let killedShipCoordinates: { x: number; y: number }[] | undefined;

    const shotShips = ships.reduce<Ship[]>((acc, ship) => {
      const { direction, cull, position, length } = ship;
      const [lengthPosition, widthPosition] = direction ? [position.y, position.x] : [position.x, position.y];
      const [lengthShot, widthShot] = direction ? [shotY, shotX] : [shotX, shotY];
      const lengthPositions = cull.map((item) => item + lengthPosition);

      if (widthShot !== widthPosition || !lengthPositions.includes(lengthShot)) {
        return [...acc, ship];
      }

      const index = lengthPositions.findIndex((position) => position === lengthShot);

      const shotCull = [...cull.slice(0, index), ...cull.slice(index + 1)];

      if (shotCull.length === 0) {
        status = AttackResult.KILLED;

        killedShipCoordinates = fillArray(length).map((position) => {
          const [x, y] = direction ? [widthPosition, position + lengthPosition] : [position + lengthPosition, widthPosition];
          return {
            x,
            y,
          };
        });

        return acc;
      } else {
        status = AttackResult.SHOT;
        return [
          ...acc,
          {
            ...ship,
            cull: shotCull,
          },
        ];
      }
    }, []);

    return {
      status: status ?? AttackResult.MISS,
      ships: shotShips,
      killedShipCoordinates,
    };
  }

  private formAttackResponse(position: Coordinates, currentPlayer: string, status: AttackResult) {
    return {
      position,
      currentPlayer,
      status,
    };
  }

  private updatePlayer(playerId: string, gameId: string, updatedData: Partial<GamePlayer>) {
    const game = gameDb.getById(gameId);

    if (!game) {
      throw new Error(UNEXPECTED_ERROR_GAME_DOESNT_EXIST);
    }

    const updatedPlayers = game.players.map((player) => {
      if (player.indexPlayer === playerId) {
        return {
          ...player,
          ...updatedData,
        };
      }

      return player;
    });

    return gameDb.update(game.id, { players: updatedPlayers });
  }
}

export const gameService = new GameService();
