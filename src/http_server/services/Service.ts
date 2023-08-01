import db from '../db/db';
import { Player } from '../types/interfaces';

class Service {
  public register({ name, password }: Player) {
    try {
      const user = db.addPlayer({ name, password });
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
}

export default new Service();
