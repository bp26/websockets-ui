import { DatabaseItem, Db } from './db';

export class Player implements DatabaseItem {
  name: string;
  password: string;
  id: string;
  online: boolean = true;
  gameId: string = '';

  constructor(name: string, password: string, playerId: string) {
    this.name = name;
    this.password = password;
    this.id = playerId;
  }
}

class PlayerDb extends Db<typeof Player, Player> {
  constructor() {
    super(Player);
  }
  public getByName(name: string) {
    return this.items.find((item) => item.name === name);
  }
}

export const playerDb = new PlayerDb();
