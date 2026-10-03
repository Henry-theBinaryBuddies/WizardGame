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
    this.placePosters();
  }

  placeExit() {
    const row = this.dungeon.rows - 1;
    const col = this.dungeon.cols - 1;

    this.dungeon.setExit(row, col);
  }

  placeArtifacts() {
    const artifacts = [
      "FLOWER",
      "POTION_GREEN",
      "COOKIES"
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

  placePosters() {
    const posters = [
      "POSTER_1",
      "POSTER_2",
      "POSTER_3",
      "POSTER_4",
      "POSTER_5",
      "POSTER_6",
      "POSTER_7"
    ];

    for (const poster of posters) {

      const placement =
        this.getRandomPosterPlacement();

      const room =
        this.dungeon.getRoom(
          placement.row,
          placement.col
        );

      room.poster = {
        type: poster,
        wall: placement.wall
      };
    }
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

  getRandomPosterPlacement() {
    while (true) {

      const row =
        Math.floor(
          Math.random() * this.dungeon.rows
        );

      const col =
        Math.floor(
          Math.random() * this.dungeon.cols
        );

      const room =
        this.dungeon.getRoom(row, col);

      if (room.poster !== null) {
        continue;
      }

      const availableWalls = [];

      if (!room.northDoor) {
        availableWalls.push("NORTH");
      }

      if (!room.southDoor) {
        availableWalls.push("SOUTH");
      }

      if (!room.eastDoor) {
        availableWalls.push("EAST");
      }

      if (!room.westDoor) {
        availableWalls.push("WEST");
      }

      if (availableWalls.length === 0) {
        continue;
      }

      const wall =
        availableWalls[
          Math.floor(
            Math.random() * availableWalls.length
          )
          ];

      return { row, col, wall };
    }
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
