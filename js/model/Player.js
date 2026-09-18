export class Player {

  constructor(row, col) {
    this.row = row;
    this.col = col;

    this.maxHp = 3;
    this.hp = 3;
    this.artifacts = [];
    this.potions = 0;

    this.direction = "EAST";
  }

  collectPotion() {
    this.potions++;
  }

  usePotion() {
    if (this.potions <= 0) {
      return false;
    }

    if (this.hp >= this.maxHp) {
      return false;
    }

    this.potions--;
    this.heal(1);

    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  getPosition() {
    return {
      row: this.row,
      col: this.col
    };
  }

  takeDamage(amount) {
    this.hp -= amount;
  }

  collectArtifact(artifact) {
    this.artifacts.push(artifact);
  }

  setPosition(row, col) {
    this.row = row;
    this.col = col;
  }

}
