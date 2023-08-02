import { playerService } from './player.service';
import { roomService } from './room.service';
import { gameService } from './game.service';
import { ArrangedMessage, Player, RoomIndex } from '../types/interfaces';
import { MessageType, ServerMessageMode } from '../types/enums';

class Service {
  public handleRegister(data: Player, playerId: string) {
    const registerData = playerService.register(data, playerId);
    const rooms = roomService.getRooms();
    const winners = playerService.getWinners();

    return [
      { mode: ServerMessageMode.SEND, data: registerData, type: MessageType.REGISTER },
      { mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM },
      { mode: ServerMessageMode.BROADCAST, data: winners, type: MessageType.UPDATE_WINNERS },
    ];
  }

  public handleCreateRoom(playerId: string) {
    const player = playerService.getPlayer(playerId);
    roomService.createRoom(player);
    const rooms = roomService.getRooms();

    return [{ mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM }];
  }

  public handleAddUser({ indexRoom: roomId }: RoomIndex, playerId: string) {
    const player = playerService.getPlayer(playerId);
    const { roomUsers } = roomService.addPlayerToRoom(roomId, player);

    const rooms = roomService.getRooms();

    const arrangedMessages: ArrangedMessage[] = [{ mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM }];

    if (roomUsers.length > 1) {
      const [playerId1, playerId2] = [roomUsers[0].index, roomUsers[1].index];
      const gameData = gameService.createGame(playerId1, playerId2);
      arrangedMessages.push({ mode: ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA, data: gameData, type: MessageType.CREATE_GAME, wsIds: [playerId1, playerId2] });
    }

    return arrangedMessages;
  }
}

export default new Service();
