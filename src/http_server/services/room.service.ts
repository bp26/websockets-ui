import { roomDb } from '../db/room.db';
import { Player } from '../db/player.db';

class RoomService {
  public getRooms() {
    return roomDb.getRooms();
  }

  public createRoom(player?: Player) {
    const { roomId } = roomDb.addRoom();
    this.addPlayerToRoom(roomId, player);
  }

  public addPlayerToRoom(roomId: string, player?: Player) {
    const room = roomDb.getRoomById(roomId);

    if (!player || !room) {
      throw new Error(`addPlayerToRoom: either player or room doesnt't exist`);
    }

    const roomUsers = [...room.roomUsers, { name: player.name, index: player.playerId }];

    roomDb.updateRoom(roomId, {
      roomUsers,
    });

    const isRoomFull = roomUsers.length > 1;

    if (isRoomFull) {
      roomDb.removeRoom(roomId);
    }

    return {
      isRoomFull,
      playersIds: roomUsers.map((user) => user.index),
    };
  }
}

export const roomService = new RoomService();
