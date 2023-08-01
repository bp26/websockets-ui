import db from '../db/db';
import { Player } from '../types/interfaces';
import { ServerMessageMode } from '../types/enums';

class Service {
  public register(data: Player) {
    return [
      { mode: ServerMessageMode.SEND, data: this.formRegisterData(data) },
      { mode: ServerMessageMode.BROADCAST, data: this.formRoomStateData() },
    ];
  }

  private formRegisterData({ name, password }: Player) {
    if (!name || !password) {
      return this.formError('Wrong data in incoming message');
    }

    try {
      const user = db.addPlayer({ name, password });
      return {
        ...user,
        error: false,
        errorText: '',
      };
    } catch (error) {
      return this.formError(error.message);
    }
  }

  private formRoomStateData() {
    return db.getRooms();
  }

  private formError(errorText: string) {
    return {
      error: true,
      errorText,
    };
  }
}

export default new Service();
