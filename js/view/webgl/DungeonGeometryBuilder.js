import {
  GeometryBuilder
} from "./GeometryBuilder.js";


export class DungeonGeometryBuilder {

  constructor(dungeon) {

    this.dungeon = dungeon;
  }


  build() {

    const walls = [];
    const floors = [];
    const ceilings = [];


    for (
      let row = 0;
      row < this.dungeon.rows;
      row++
    ) {

      for (
        let col = 0;
        col < this.dungeon.cols;
        col++
      ) {

        const room =
          this.dungeon.getRoom(
            row,
            col
          );


        // -----------------------------------------------------
        // FLOOR
        // -----------------------------------------------------

        this.addFloor(
          floors,
          row,
          col
        );


        // -----------------------------------------------------
        // CEILING
        // -----------------------------------------------------

        this.addCeiling(
          ceilings,
          row,
          col
        );


        /*
         * NORTH and WEST walls are generated
         * for every room.
         *
         * SOUTH and EAST walls are only needed
         * on the dungeon outer boundary.
         */


        // -----------------------------------------------------
        // NORTH WALL
        // -----------------------------------------------------

        if (!room.northDoor) {

          this.addNorthWall(
            walls,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // WEST WALL
        // -----------------------------------------------------

        if (!room.westDoor) {

          this.addWestWall(
            walls,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // SOUTH OUTER WALL
        // -----------------------------------------------------

        if (
          row ===
          this.dungeon.rows - 1
          &&
          !room.southDoor
        ) {

          this.addSouthWall(
            walls,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // EAST OUTER WALL
        // -----------------------------------------------------

        if (
          col ===
          this.dungeon.cols - 1
          &&
          !room.eastDoor
        ) {

          this.addEastWall(
            walls,
            row,
            col
          );
        }
      }
    }


    return {
      walls,
      floors,
      ceilings
    };
  }


  addFloor(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z1 = row;
    const z2 = row + 1;

    const y = 0;


    GeometryBuilder.addQuad(
      vertices,

      [
        x1,
        y,
        z1
      ],

      [
        x2,
        y,
        z1
      ],

      [
        x2,
        y,
        z2
      ],

      [
        x1,
        y,
        z2
      ]
    );
  }


  addCeiling(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z1 = row;
    const z2 = row + 1;

    const y = 1;


    GeometryBuilder.addQuad(
      vertices,

      [
        x1,
        y,
        z2
      ],

      [
        x2,
        y,
        z2
      ],

      [
        x2,
        y,
        z1
      ],

      [
        x1,
        y,
        z1
      ]
    );
  }


  addNorthWall(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z = row;


    GeometryBuilder.addQuad(
      vertices,

      [
        x1,
        0,
        z
      ],

      [
        x2,
        0,
        z
      ],

      [
        x2,
        1,
        z
      ],

      [
        x1,
        1,
        z
      ]
    );
  }


  addSouthWall(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z =
      row + 1;


    GeometryBuilder.addQuad(
      vertices,

      [
        x2,
        0,
        z
      ],

      [
        x1,
        0,
        z
      ],

      [
        x1,
        1,
        z
      ],

      [
        x2,
        1,
        z
      ]
    );
  }


  addWestWall(
    vertices,
    row,
    col
  ) {

    const x = col;

    const z1 = row;
    const z2 = row + 1;


    GeometryBuilder.addQuad(
      vertices,

      [
        x,
        0,
        z2
      ],

      [
        x,
        0,
        z1
      ],

      [
        x,
        1,
        z1
      ],

      [
        x,
        1,
        z2
      ]
    );
  }


  addEastWall(
    vertices,
    row,
    col
  ) {

    const x =
      col + 1;

    const z1 = row;
    const z2 = row + 1;


    GeometryBuilder.addQuad(
      vertices,

      [
        x,
        0,
        z1
      ],

      [
        x,
        0,
        z2
      ],

      [
        x,
        1,
        z2
      ],

      [
        x,
        1,
        z1
      ]
    );
  }
}
