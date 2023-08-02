import { Room } from '../types/interfaces';
import { v4 } from 'uuid';

class RoomDb {
  private rooms: Room[] = [];

  public getRooms() {
    return this.rooms;
  }

  public addRoom() {
    const room = {
      roomId: v4(),
      roomUsers: [],
    };
    this.rooms.push(room);
    return room;
  }

  public getRoomById(id: string) {
    return this.rooms.find((item) => item.roomId === id);
  }

  public updateRoom(roomId: string, data: Partial<Room>) {
    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId);
    this.rooms[roomIndex] = {
      ...this.rooms[roomIndex],
      ...data,
    };
    return this.rooms[roomIndex];
  }

  public removeRoom(roomId: string) {
    this.rooms.filter((room) => room.roomId !== roomId);
  }
}

export const roomDb = new RoomDb();
