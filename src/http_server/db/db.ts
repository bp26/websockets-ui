import { Room, Winner, RegisteredPlayer } from '../types/interfaces';
import { v4 } from 'uuid';

class Db {
  private players: RegisteredPlayer[] = [];
  private rooms: Room[] = [];
  private winners: Winner[] = [];

  public addPlayer({ name, password, id }: RegisteredPlayer) {
    const player = this.players.find((item) => item.name === name);

    if (!player) {
      this.players.push({ name, password, id });
    } else if (player.password !== password) {
      throw new Error('Wrong password');
    } else {
      this.players[this.players.findIndex((item) => item.name === name)].id === id;
    }

    return {
      name,
      index: id,
    };
  }

  public getPlayerById(id: string) {
    return this.players.find((item) => item.id === id);
  }

  public getRooms() {
    return this.rooms;
  }

  public addRoom() {
    const room = {
      roomId: v4(),
      roomUsers: [],
    };
    this.rooms.push(room);
  }

  public getRoomById(roomId: string) {
    return this.rooms.find((item) => item.roomId === roomId);
  }

  public updateRoom(roomId: string, data: Partial<Room>) {
    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId);
    this.rooms[roomIndex] = {
      ...this.rooms[roomIndex],
      ...data,
    };
  }

  public removeRoom() {}

  public getWinners() {
    return this.winners;
  }

  public addWinner() {}
}

export default new Db();
