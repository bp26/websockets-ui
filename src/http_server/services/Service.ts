import db from '../db/db';
import { Player, RoomIndex } from '../types/interfaces';
import { MessageType, ServerMessageMode } from '../types/enums';

class Service {
  public handleRegister(data: Player, playerId: string) {
    const registerData = this.register(data, playerId);
    const rooms = db.getRooms();
    const winners = db.getWinners();

    return [
      { mode: ServerMessageMode.SEND, data: registerData, type: MessageType.REGISTER },
      { mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM },
      { mode: ServerMessageMode.BROADCAST, data: winners, type: MessageType.UPDATE_WINNERS },
    ];
  }

  public handleCreateRoom(playerId: string) {
    this.createRoom(playerId);
    const rooms = db.getRooms();

    return [{ mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM }];
  }

  public handleAddUser({ roomId }: RoomIndex, playerId: string) {
    const { roomUsers } = this.addPlayerToRoom(roomId, playerId);
    const rooms = db.getRooms();

    const arrangedData = [{ mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM }];

    if (roomUsers.length > 1) {
      db.removeRoom(roomId);
      arrangedData.push({ mode: ServerMessageMode.BROADCAST_SELECTIVE, data: rooms, type: MessageType.CREATE_GAME });
    }

    return arrangedData;
  }

  private register({ name, password }: Player, playerId: string) {
    try {
      const user = db.addPlayer({ name, password, id: playerId });
      return {
        ...user,
        error: false,
        errorText: '',
      };
    } catch (error) {
      return {
        error: true,
        errorText: (error as Error).message,
      };
    }
  }

  private createRoom(playerId: string) {
    const { roomId } = db.addRoom();
    this.addPlayerToRoom(roomId, playerId);
  }

  private addPlayerToRoom(roomId: string, playerId: string) {
    const player = db.getPlayerById(playerId)!;
    const room = db.getRoomById(roomId)!;

    const roomUsers = [...room.roomUsers, { name: player.name, index: player.id }];

    const updatedRoom = db.updateRoom(roomId, {
      roomUsers,
    });

    return updatedRoom;
  }

  private createGame() {}
}

export default new Service();
