import { roomDb } from '../db/room.db';
import { RegisteredPlayer } from '../types/interfaces';

class RoomService {
  public getRooms() {
    return roomDb.getRooms();
  }

  public createRoom(player?: RegisteredPlayer) {
    const { roomId } = roomDb.addRoom();
    this.addPlayerToRoom(roomId, player);
  }

  public addPlayerToRoom(roomId: string, player?: RegisteredPlayer) {
    const room = roomDb.getRoomById(roomId);

    if (!player || !room) {
      throw new Error(`addPlayerToRoom: either player or room doesnt't exist`);
    }

    const roomUsers = [...room.roomUsers, { name: player.name, index: player.id }];

    const updatedRoom = roomDb.updateRoom(roomId, {
      roomUsers,
    });

    if (roomUsers.length > 1) {
      roomDb.removeRoom(roomId);
    }

    return updatedRoom;
  }
}

export const roomService = new RoomService();
