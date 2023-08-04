import { winnerDb } from '../db/winner.db';

class WinnerService {
  public getWinners() {
    return winnerDb.getAll();
  }

  public addWin(name: string) {
    const winner = winnerDb.getByName(name);

    if (!winner) {
      winnerDb.add(name);
    } else {
      winnerDb.update(winner.id, {
        ...winner,
        wins: winner.wins++,
      });
    }
  }
}

export const winnerService = new WinnerService();
