import { Winner, RegisteredPlayer } from '../types/interfaces';

class PlayerDb {
  private players: RegisteredPlayer[] = [];
  private winners: Winner[] = [];

  public addPlayer({ name, password, id }: RegisteredPlayer) {
    const player = this.players.find((item) => item.name === name);

    if (!player) {
      this.players.push({ name, password, id });
    } else if (player.password !== password) {
      throw new Error('Wrong password');
    } else {
      this.players[this.players.findIndex((item) => item.name === name)].id === id;
    }

    return {
      name,
      index: id,
    };
  }

  public getPlayerById(id: string) {
    return this.players.find((item) => item.id === id);
  }

  public getWinners() {
    return this.winners;
  }

  public addWinner() {}
}

export const playerDb = new PlayerDb();
