import { ExtDb, NamedDatabaseItem } from './db';

export class Player implements NamedDatabaseItem {
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

export const playerDb = new ExtDb<typeof Player, Player>(Player);
