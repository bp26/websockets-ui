import { Db, DatabaseItem } from './db';
import { v4 } from 'uuid';

export class Room implements DatabaseItem {
  id: string = v4();
  roomUsers: { name: string; index: string }[] = [];
}

export const roomDb = new Db<typeof Room, Room>(Room);
