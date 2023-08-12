import { playerService } from './player.service';
import { roomService } from './room.service';
import { gameService } from './game.service';
import { winnerService } from './winner.service';
import { ArrangedMessage, AttackData, GameData, PlayerData, RandomAttackData, RoomData } from '../types/interfaces';
import { AttackResult, MessageType, ServerMessageMode } from '../types/enums';
import { ServerError } from '../utils/ServerError';
import { ERROR_PLAYER_NOT_LOGGED_IN } from '../utils/constants';
import { Player } from '../db/player.db';

class Service {
  public handleRegister(data: PlayerData, playerId: string): ArrangedMessage[] {
    const registerData = playerService.register(data, playerId);

    return [
      {
        mode: ServerMessageMode.SEND,
        data: registerData,
        type: MessageType.REGISTER,
      },
      { mode: ServerMessageMode.BROADCAST, data: roomService.getRooms(), type: MessageType.UPDATE_ROOM },
      { mode: ServerMessageMode.BROADCAST, data: winnerService.getWinners(), type: MessageType.UPDATE_WINNERS },
    ];
  }

  public handleCreateRoom(playerId: string): ArrangedMessage[] {
    const player = playerService.getPlayerById(playerId);

    if (!player) {
      throw new ServerError(ERROR_PLAYER_NOT_LOGGED_IN);
    }

    roomService.createRoom(player);

    return [
      {
        mode: ServerMessageMode.BROADCAST,
        data: roomService.getRooms(),
        type: MessageType.UPDATE_ROOM,
      },
    ];
  }

  public handleAddUser({ indexRoom: roomId }: RoomData, playerId: string): ArrangedMessage[] {
    const player = playerService.getPlayerById(playerId);

    if (!player) {
      throw new ServerError(ERROR_PLAYER_NOT_LOGGED_IN);
    }

    const { isRoomFull, playersIds } = roomService.addPlayerToRoom(roomId, player);

    const arrangedMessages: ArrangedMessage[] = [
      {
        mode: ServerMessageMode.BROADCAST,
        data: roomService.getRooms(),
        type: MessageType.UPDATE_ROOM,
      },
    ];

    if (isRoomFull) {
      const { data, gameId } = gameService.createGame(playersIds[0], playersIds[1]);
      playersIds.forEach((id) => playerService.addGameIdToPlayer(id, gameId));
      arrangedMessages.push({
        mode: ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA,
        data,
        type: MessageType.CREATE_GAME,
        wsIds: playersIds,
      });
    }

    return arrangedMessages;
  }

  public handleAddShips(data: GameData, playerId: string): ArrangedMessage[] {
    const player = playerService.getPlayerById(playerId);

    if (!player) {
      throw new ServerError(ERROR_PLAYER_NOT_LOGGED_IN);
    }

    const { arePlayersReady, playersIds, gameData } = gameService.addShips(data, playerId, player.gameId);

    const arrangedMessages: ArrangedMessage[] = [];

    if (arePlayersReady) {
      arrangedMessages.push(
        {
          mode: ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA,
          data: gameService.startGame(gameData),
          type: MessageType.START_GAME,
          wsIds: playersIds,
        },
        {
          mode: ServerMessageMode.BROADCAST_SELECTIVE,
          data: gameService.beginTurn(gameData.id, playersIds[0]),
          type: MessageType.TURN,
          wsIds: playersIds,
        }
      );
    }

    return arrangedMessages;
  }

  public handleAttack(data: AttackData) {
    const player = playerService.getPlayerById(data.indexPlayer);

    if (!player) {
      throw new ServerError(ERROR_PLAYER_NOT_LOGGED_IN);
    }

    const { status, nextPlayer, playersIds, shotData, killedShipData, areShipsEmpty } = gameService.performAttack(data);

    const arrangedMessages: ArrangedMessage[] = [];

    if (status === AttackResult.KILLED && killedShipData) {
      arrangedMessages.push(
        ...killedShipData.map((data) => {
          return {
            mode: ServerMessageMode.BROADCAST_SELECTIVE,
            data,
            type: MessageType.ATTACK,
            wsIds: playersIds,
          };
        })
      );
    } else {
      arrangedMessages.push({
        mode: ServerMessageMode.BROADCAST_SELECTIVE,
        data: shotData,
        type: MessageType.ATTACK,
        wsIds: playersIds,
      });
    }

    if (areShipsEmpty) {
      return this.handleWin(data, player, playersIds);
    } else {
      arrangedMessages.push({
        mode: ServerMessageMode.BROADCAST_SELECTIVE,
        data: gameService.beginTurn(data.gameId, nextPlayer),
        type: MessageType.TURN,
        wsIds: playersIds,
      });
    }

    return arrangedMessages;
  }

  public handleRandomAttack(data: RandomAttackData) {
    const { x, y } = gameService.generateRandomCoordinates();
    return this.handleAttack({ ...data, x, y });
  }

  public handleClose(playerId: string) {
    playerService.logoffPlayer(playerId);
  }

  private handleWin(gameData: AttackData, player: Player, playersIds: string[]) {
    playersIds.forEach((id) => playerService.addGameIdToPlayer(id, ''));
    winnerService.addWin(player.name);

    return [
      {
        mode: ServerMessageMode.BROADCAST_SELECTIVE,
        data: gameService.finishGame(gameData.gameId, gameData.indexPlayer),
        type: MessageType.FINISH,
        wsIds: playersIds,
      },
      { mode: ServerMessageMode.BROADCAST, data: winnerService.getWinners(), type: MessageType.UPDATE_WINNERS },
    ];
  }
}

export default new Service();
