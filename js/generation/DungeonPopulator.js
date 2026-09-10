export class DungeonPopulator {

  constructor(dungeon) {
    this.dungeon = dungeon;
  }

  populate() {
    this.placeExit();
    this.placePlayerStart();
    this.placeArtifacts();
    this.placeTraps(5);
    this.placePotions(5);
  }

  placeExit() {
    const row = this.dungeon.rows - 1;
    const col = this.dungeon.cols - 1;

    this.dungeon.setExit(row, col);
  }

  placeArtifacts() {
    const artifacts = [
      "ARTIFACT_ONE",
      "ARTIFACT_TWO",
      "ARTIFACT_THREE"
    ];

    for (const artifact of artifacts) {
      const position =
        this.getRandomAvailablePosition();

      this.dungeon
        .getRoom(position.row, position.col)
        .artifact = artifact;
    }
  }

  placeTraps(count) {
    for (let i = 0; i < count; i++) {
      const position =
        this.getRandomAvailablePosition();

      this.dungeon
        .getRoom(position.row, position.col)
        .hasTrap = true;
    }
  }

  placePotions(count) {
    for (let i = 0; i < count; i++) {
      const position =
        this.getRandomAvailablePosition();

      this.dungeon
        .getRoom(position.row, position.col)
        .hasPotion = true;
    }
  }

  placePlayerStart() {
    this.dungeon.setPlayerStart(0, 0);
  }

  getRandomAvailablePosition() {
    let row;
    let col;
    let room;

    do {
      row = Math.floor(
        Math.random() * this.dungeon.rows
      );

      col = Math.floor(
        Math.random() * this.dungeon.cols
      );

      room =
        this.dungeon.getRoom(row, col);

    } while (!this.isAvailable(room, row, col));

    return { row, col };
  }

  isAvailable(room, row, col) {
    return !room.isExit
      && !room.hasTrap
      && !room.hasArtifact()
      && !this.isPlayerStart(row, col);
  }

  isPlayerStart(row, col) {
    const start =
      this.dungeon.playerStart;

    return start !== null
      && start.row === row
      && start.col === col;
  }
}
