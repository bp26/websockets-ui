import { Room, Winner, RegisteredPlayer, Game } from '../types/interfaces';
import { v4 } from 'uuid';

class Db {
  private players: RegisteredPlayer[] = [];
  private rooms: Room[] = [];
  private winners: Winner[] = [];
  private games: Game[] = [];

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

  public addGame(playerId1: string, playerId2: string) {
    const player1 = {
      id: playerId1,
      ships: [],
    };
    const player2 = {
      id: playerId2,
      ships: [],
    };
    const game = {
      gameId: v4(),
      player1,
      player2,
    };
    this.games.push(game);
    return game;
  }

  public getWinners() {
    return this.winners;
  }

  public addWinner() {}
}

export default new Db();
