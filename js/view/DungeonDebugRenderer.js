export class DungeonDebugRenderer {

  constructor(dungeon, player, wizard, pathfinder) {
    this.dungeon = dungeon;
    this.player = player;
    this.wizard = wizard;
    this.pathfinder = pathfinder;
  }

  render() {
    let output = "";

    for (let row = 0; row < this.dungeon.rows; row++) {
      const roomLines = [];

      for (let col = 0; col < this.dungeon.cols; col++) {
        const room = this.dungeon.getRoom(row, col);

        roomLines.push(
          this.renderRoom(room, row, col)
        );
      }

      const startingLine = row === 0 ? 0 : 1;

      for (let line = startingLine; line < 3; line++) {
        for (let col = 0; col < roomLines.length; col++) {

          if (col === 0) {
            output += roomLines[col][line];
          } else {
            output += roomLines[col][line].substring(1);
          }
        }

        output += "\n";
      }
    }

    return output;
  }

  renderRoom(room, row, col) {
    const north =
      room.northDoor ? "* *" : "***";

    const south =
      room.southDoor ? "* *" : "***";

    const west =
      room.westDoor ? " " : "*";

    const east =
      room.eastDoor ? " " : "*";

    const center =
      this.getCenterChar(room, row, col);

    return [
      north,
      west + center + east,
      south
    ];
  }

  getPlayerChar() {
    switch (this.player.direction) {
      case "NORTH":
        return "^";

      case "SOUTH":
        return "v";

      case "EAST":
        return ">";

      case "WEST":
        return "<";

      default:
        return "@";
    }
  }

  getCenterChar(room, row, col) {

    if (this.isPlayerHere(row, col)) {
      return this.getPlayerChar();
    }

    if (this.isWizardHere(row, col)) {
      return "W";
    }

    if (room.isExit) {
      return "E";
    }

    if (room.hasArtifact()) {
      return "A";
    }

    if (room.hasTrap) {
      return room.trapTriggered ? "x" : "X";
    }

    if (room.hasPotion) {
      return "H";
    }

    return " ";
  }

  isPlayerHere(row, col) {
    return this.player.row === row
      && this.player.col === col;
  }

  isWizardHere(row, col) {
    return (
      this.wizard.row === row
      && this.wizard.col === col
    );
  }
}
