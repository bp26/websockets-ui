import { Player } from '../types/interfaces';

class Db {
  private players: Player[] = [];

  public addPlayer({ name, password }: Player) {
    const player = this.players.find((item) => item.name === name);

    if (!player) {
      this.players.push({ name, password });
    } else {
      if (player.password !== password) {
        throw new Error('Wrong password');
      }
    }

    return {
      name,
      index: this.players.length - 1,
    };
  }
}

export default new Db();
