import { playerService } from './player.service';
import { roomService } from './room.service';
import { gameService } from './game.service';
import { winnerService } from './winner.service';
import { ArrangedMessage, GameData, PlayerData, RoomData } from '../types/interfaces';
import { MessageType, ServerMessageMode } from '../types/enums';

class Service {
  public handleRegister(data: PlayerData, playerId: string) {
    const registerData = playerService.register(data, playerId);
    const rooms = roomService.getRooms();
    const winners = winnerService.getWinners();

    return [
      { mode: ServerMessageMode.SEND, data: registerData, type: MessageType.REGISTER },
      { mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM },
      { mode: ServerMessageMode.BROADCAST, data: winners, type: MessageType.UPDATE_WINNERS },
    ];
  }

  public handleCreateRoom(playerId: string) {
    const player = playerService.getPlayer(playerId);
    roomService.createRoom(player);

    return [{ mode: ServerMessageMode.BROADCAST, data: roomService.getRooms(), type: MessageType.UPDATE_ROOM }];
  }

  public handleAddUser({ indexRoom: roomId }: RoomData, playerId: string) {
    const player = playerService.getPlayer(playerId);
    const { isRoomFull, playersIds } = roomService.addPlayerToRoom(roomId, player);

    const arrangedMessages: ArrangedMessage[] = [{ mode: ServerMessageMode.BROADCAST, data: roomService.getRooms(), type: MessageType.UPDATE_ROOM }];

    if (isRoomFull) {
      const { data, id: gameId } = gameService.createGame(playersIds[0], playersIds[1]);
      playersIds.forEach((id) => playerService.addGameIdToPlayer(id, gameId));
      arrangedMessages.push({ mode: ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA, data, type: MessageType.CREATE_GAME, wsIds: playersIds });
    }

    return arrangedMessages;
  }

  public handleAddShips(data: GameData, playerId: string) {
    const { gameId } = playerService.getPlayer(playerId)!;
    const { arePlayersReady, playersIds, gameData } = gameService.addShips(data, playerId, gameId);

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
          data: { currentPlayer: playersIds[0] },
          type: MessageType.TURN,
          wsIds: playersIds,
        }
      );
    }

    return arrangedMessages;
  }
}

export default new Service();
