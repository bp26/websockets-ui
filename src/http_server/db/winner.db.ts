import { Db, DatabaseItem } from './db';
import { v4 } from 'uuid';

export class Winner implements DatabaseItem {
  id: string = v4();
  wins: number = 1;
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class WinnerDb extends Db<typeof Winner, Winner> {
  constructor() {
    super(Winner);
  }
  public getByName(name: string) {
    return this.items.find((item) => item.name === name);
  }
}

export const winnerDb = new WinnerDb();
