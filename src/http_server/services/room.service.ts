import { roomDb } from '../db/room.db';
import { Player } from '../db/player.db';
import { ServerError } from '../utils/ServerError';
import { ERROR_ROOM_DOESNT_EXIST } from '../utils/constants';

class RoomService {
  public getRooms() {
    return roomDb.getAll().map((room) => {
      return {
        ...room,
        roomId: room.id,
      };
    });
  }

  public getRoomById(id: string) {
    return roomDb.getById(id);
  }

  public createRoom(player: Player) {
    const { id } = roomDb.add();
    this.addPlayerToRoom(id, player);
  }

  public addPlayerToRoom(roomId: string, player: Player) {
    const room = roomDb.getById(roomId);

    if (!room) {
      throw new ServerError(ERROR_ROOM_DOESNT_EXIST);
    }

    const roomUsers = [...room.roomUsers];

    if (!room.roomUsers.find((user) => user.index === player.id)) {
      roomUsers.push({ name: player.name, index: player.id });
    }

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
