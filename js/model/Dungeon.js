import { Room } from "./Room.js";

export class Dungeon {

  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;

    this.rooms = Array.from(
      { length: rows },
      () => Array.from(
        { length: cols },
        () => new Room()
      )
    );

    this.playerStart = null;
    this.exitPosition = null;
  }

  getRoom(row, col) {
    return this.rooms[row][col];
  }

  inBounds(row, col) {
    return row >= 0
      && row < this.rows
      && col >= 0
      && col < this.cols;
  }

  setPlayerStart(row, col) {
    this.playerStart = {
      row: row,
      col: col
    };
  }

  setExit(row, col) {
    this.exitPosition = {
      row: row,
      col: col
    };

    this.getRoom(row, col).isExit = true;
  }
}
