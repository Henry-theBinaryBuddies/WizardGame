export class Wizard {

  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  getPosition() {
    return {
      row: this.row,
      col: this.col
    };
  }

  setPosition(row, col) {
    this.row = row;
    this.col = col;
  }

}
