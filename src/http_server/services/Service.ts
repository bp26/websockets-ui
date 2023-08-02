import db from '../db/db';
import { ArrangedMessage, Player, RoomIndex } from '../types/interfaces';
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

  public handleAddUser({ indexRoom: roomId }: RoomIndex, playerId: string) {
    const { roomUsers } = this.addPlayerToRoom(roomId, playerId);
    const rooms = db.getRooms();

    const arrangedMessages: ArrangedMessage[] = [{ mode: ServerMessageMode.BROADCAST, data: rooms, type: MessageType.UPDATE_ROOM }];

    if (roomUsers.length > 1) {
      db.removeRoom(roomId);
      const [playerId1, playerId2] = [roomUsers[0].index, roomUsers[1].index];
      const gameData = this.createGame(playerId1, playerId2);
      arrangedMessages.push({ mode: ServerMessageMode.BROADCAST_SELECTIVE_CYCLE_DATA, data: gameData, type: MessageType.CREATE_GAME, wsIds: [playerId1, playerId2] });
    }

    return arrangedMessages;
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
    const player = db.getPlayerById(playerId);
    const room = db.getRoomById(roomId);

    if (!player || !room) {
      throw new Error(`addPlayerToRoom: either player or room doesnt't exist`);
    }

    const roomUsers = [...room.roomUsers, { name: player.name, index: player.id }];

    const updatedRoom = db.updateRoom(roomId, {
      roomUsers,
    });

    return updatedRoom;
  }

  private createGame(playerId1: string, playerId2: string) {
    const { gameId: idGame } = db.addGame(playerId1, playerId2);
    return [
      {
        id: playerId1,
        data: {
          idGame,
          idPlayer: playerId1,
        },
      },
      {
        id: playerId2,
        data: {
          idGame,
          idPlayer: playerId2,
        },
      },
    ];
  }
}

export default new Service();
