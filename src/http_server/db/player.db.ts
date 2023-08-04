import { UnregisteredPlayer, Winner } from '../types/interfaces';

export class Player {
  name: string;
  password: string;
  playerId: string;
  online: boolean = true;
  gameId: string = '';

  constructor(name: string, password: string, playerId: string) {
    this.name = name;
    this.password = password;
    this.playerId = playerId;
  }
}
class PlayerDb {
  private players: Player[] = [];
  private winners: Winner[] = [];

  public addPlayer({ name, password, id }: UnregisteredPlayer) {
    const player = new Player(name, password, id);
    this.players.push(player);
    return player;
  }

  public updatePlayer(playerId: string, data: Partial<Player>) {
    const playerIndex = this.players.findIndex((item) => item.playerId === playerId);
    this.players[playerIndex] = {
      ...this.players[playerIndex],
      ...data,
    };
    return this.players[playerIndex];
  }

  public getPlayerById(id: string) {
    return this.players.find((item) => item.playerId === id);
  }

  public getPlayerByName(name: string) {
    return this.players.find((item) => item.name === name);
  }

  public getWinners() {
    return this.winners;
  }

  public addWinner() {}
}

export const playerDb = new PlayerDb();
