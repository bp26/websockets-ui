import { NamedDatabaseItem, ExtDb } from './db';
import { v4 } from 'uuid';

export class Winner implements NamedDatabaseItem {
  id: string = v4();
  wins: number = 1;
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export const winnerDb = new ExtDb<typeof Winner, Winner>(Winner);
