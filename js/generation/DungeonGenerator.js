import { Dungeon } from "../model/Dungeon.js";

export class DungeonGenerator {

  constructor(rows = 10, cols = 10) {
    this.rows = rows;
    this.cols = cols;
  }

  generateDungeon() {
    const dungeon = new Dungeon(this.rows, this.cols);

    const visited = Array.from(
      { length: this.rows },
      () => Array(this.cols).fill(false)
    );

    this.carveMaze(dungeon, visited, 0, 0);

    this.addExtraConnections(
      dungeon,
      0.30
    );

    return dungeon;
  }

  addExtraConnections(dungeon, chance = 0.15) {
    for (let row = 0; row < dungeon.rows; row++) {
      for (let col = 0; col < dungeon.cols; col++) {

        const room = dungeon.getRoom(row, col);

        // Try opening east wall
        if (
          col < dungeon.cols - 1
          && !room.eastDoor
          && Math.random() < chance
        ) {
          room.openEastDoor();

          dungeon
            .getRoom(row, col + 1)
            .openWestDoor();
        }

        // Try opening south wall
        if (
          row < dungeon.rows - 1
          && !room.southDoor
          && Math.random() < chance
        ) {
          room.openSouthDoor();

          dungeon
            .getRoom(row + 1, col)
            .openNorthDoor();
        }
      }
    }
  }

  carveMaze(dungeon, visited, row, col) {
    visited[row][col] = true;

    const directions = [
      "NORTH",
      "SOUTH",
      "EAST",
      "WEST"
    ];

    this.shuffle(directions);

    for (const direction of directions) {
      const next = this.getNextPosition(
        row,
        col,
        direction
      );

      if (
        dungeon.inBounds(next.row, next.col)
        && !visited[next.row][next.col]
      ) {
        const currentRoom =
          dungeon.getRoom(row, col);

        const nextRoom =
          dungeon.getRoom(next.row, next.col);

        this.openDoors(
          currentRoom,
          nextRoom,
          direction
        );

        this.carveMaze(
          dungeon,
          visited,
          next.row,
          next.col
        );
      }
    }
  }

  getNextPosition(row, col, direction) {
    switch (direction) {
      case "NORTH":
        return { row: row - 1, col: col };

      case "SOUTH":
        return { row: row + 1, col: col };

      case "EAST":
        return { row: row, col: col + 1 };

      case "WEST":
        return { row: row, col: col - 1 };
    }
  }

  openDoors(room1, room2, direction) {
    switch (direction) {
      case "NORTH":
        room1.openNorthDoor();
        room2.openSouthDoor();
        break;

      case "SOUTH":
        room1.openSouthDoor();
        room2.openNorthDoor();
        break;

      case "EAST":
        room1.openEastDoor();
        room2.openWestDoor();
        break;

      case "WEST":
        room1.openWestDoor();
        room2.openEastDoor();
        break;
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j =
        Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] =
        [array[j], array[i]];
    }
  }
}
