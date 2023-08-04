import { gameDb } from '../db/game.db';
import { GameData } from '../types/interfaces';
import { Game } from '../db/game.db';

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
      throw new Error(`addShips: game doesnt't exist`);
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
        ships: player.ships,
        currentPlayerIndex: player.indexPlayer,
      };
    });
  }
}

export const gameService = new GameService();
