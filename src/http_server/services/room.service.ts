import { roomDb } from '../db/room.db';
import { Player } from '../db/player.db';

class RoomService {
  public getRooms() {
    return roomDb.getAll();
  }

  public createRoom(player?: Player) {
    const { id } = roomDb.add();
    this.addPlayerToRoom(id, player);
  }

  public addPlayerToRoom(roomId: string, player?: Player) {
    const room = roomDb.getById(roomId);

    if (!player || !room) {
      throw new Error(`addPlayerToRoom: either player or room doesnt't exist`);
    }

    const roomUsers = [...room.roomUsers, { name: player.name, index: player.id }];

    roomDb.update(roomId, {
      roomUsers,
    });

    const isRoomFull = roomUsers.length > 1;

    if (isRoomFull) {
      roomDb.remove(roomId);
    }

    return {
      isRoomFull,
      playersIds: roomUsers.map((user) => user.index),
    };
  }
}

export const roomService = new RoomService();
