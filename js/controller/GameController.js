export class GameController {

  constructor(dungeon, player, wizard, pathfinder) {
    this.dungeon = dungeon;
    this.player = player;
    this.wizard = wizard;
    this.pathfinder = pathfinder;

    this.gameOver = false;
    this.gameWon = false;
  }

  checkForLoss() {
    if (this.player.hp <= 0) {
      this.gameOver = true;
      console.log("LOSS TRIGGERED");
      return true;
    }

    return false;
  }

  checkForWin() {
    const room =
      this.dungeon.getRoom(
        this.player.row,
        this.player.col
      );

    console.log(
      "Checking win:",
      "Exit =", room.isExit,
      "Artifacts =", this.player.artifacts
    );

    if (
      room.isExit
      && this.player.artifacts.length === 3
    ) {
      this.gameWon = true;
      this.gameOver = true;
      return true;
    }

    return false;
  }

  turnLeft() {
    if (this.gameOver) {
      return;
    }

    const directions = [
      "NORTH",
      "WEST",
      "SOUTH",
      "EAST"
    ];

    const index =
      directions.indexOf(this.player.direction);

    const nextIndex =
      (index + 1) % directions.length;

    this.player.direction =
      directions[nextIndex];
  }

  turnRight() {
    if (this.gameOver) {
      return;
    }

    const directions = [
      "NORTH",
      "EAST",
      "SOUTH",
      "WEST"
    ];

    const index =
      directions.indexOf(this.player.direction);

    const nextIndex =
      (index + 1) % directions.length;

    this.player.direction =
      directions[nextIndex];
  }

  moveForward() {
    const room =
      this.dungeon.getRoom(
        this.player.row,
        this.player.col
      );

    if (this.gameOver) {
      return false;
    }

    if (!this.canMoveForward(room)) {
      return false;
    }

    switch (this.player.direction) {
      case "NORTH":
        this.player.row--;
        break;

      case "SOUTH":
        this.player.row++;
        break;

      case "EAST":
        this.player.col++;
        break;

      case "WEST":
        this.player.col--;
        break;
    }

    this.resolveCurrentRoom();

    if (!this.gameOver) {
      this.moveWizard();
    }

    this.checkForWizardCollision();

    return true;
  }

  resolveCurrentRoom() {
    const room =
      this.dungeon.getRoom(
        this.player.row,
        this.player.col
      );

    this.handleTrap(room);
    this.handleArtifact(room);
    this.handlePotion(room);
    this.checkForLoss();
    this.checkForWin();
  }

  handleTrap(room) {
    if (room.triggerTrap()) {
      this.player.takeDamage(1);
    }
  }

  handleArtifact(room) {
    if (!room.hasArtifact()) {
      return;
    }

    const artifact =
      room.removeArtifact();

    this.player.collectArtifact(artifact);
  }

  handlePotion(room) {
    if (!room.hasPotion) {
      return;
    }

    this.player.collectPotion();
    room.hasPotion = false;
  }

  usePotion() {
    return this.player.usePotion();
  }

  moveWizard() {
    const path =
      this.pathfinder.findPath(
        this.dungeon,
        this.wizard.getPosition(),
        this.player.getPosition()
      );

    console.log("Wizard path:", path);

    if (!path || path.length <= 1) {
      return;
    }

    const nextStep = path[1];

    this.wizard.setPosition(
      nextStep.row,
      nextStep.col
    );

    console.log(
      "Wizard moved to:",
      this.wizard.row,
      this.wizard.col
    );
  }

  checkForWizardCollision() {
    if (
      this.player.row === this.wizard.row
      && this.player.col === this.wizard.col
    ) {
      this.player.takeDamage(2);

      this.wizard.setPosition(
        this.dungeon.exitPosition.row,
        this.dungeon.exitPosition.col
      );

      this.checkForLoss();

      return true;
    }

    return false;
  }

  canMoveForward(room) {
    switch (this.player.direction) {
      case "NORTH":
        return room.northDoor;

      case "SOUTH":
        return room.southDoor;

      case "EAST":
        return room.eastDoor;

      case "WEST":
        return room.westDoor;

      default:
        return false;
    }
  }
}
