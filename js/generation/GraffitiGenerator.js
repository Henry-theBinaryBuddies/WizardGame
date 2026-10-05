export class GraffitiGenerator {

  constructor(dungeon) {
    this.dungeon = dungeon;
  }


  generate() {

    const placements = [];

    const graffitiTypes = [
      "GRAFFITI_1",
      "GRAFFITI_2",
      "GRAFFITI_3",
      "GRAFFITI_4",
      "GRAFFITI_5",
      "GRAFFITI_6"
    ];

    const occupiedWalls =
      new Set();


    for (
      const texture
      of graffitiTypes
      ) {

      let candidates =
        this.findCandidates(
          3,
          occupiedWalls
        );


      if (candidates.length === 0) {

        candidates =
          this.findCandidates(
            2,
            occupiedWalls
          );
      }


      if (candidates.length === 0) {

        console.warn(
          "No valid location for",
          texture
        );

        continue;
      }


      const candidate =
        candidates[
          Math.floor(
            Math.random()
            * candidates.length
          )
          ];


      placements.push({
        row: candidate.row,
        col: candidate.col,
        wall: candidate.wall,
        length: candidate.length,
        texture: texture
      });


      for (
        const key
        of candidate.wallKeys
        ) {

        occupiedWalls.add(key);
      }
    }


    return placements;
  }

  // =========================================================
  // WALL GRAFFITI
  // =========================================================

  findHorizontalGraffitiCandidates(
    length,
    occupiedWalls,
    candidates
  ) {

    for (
      let wallRow = 0;
      wallRow <= this.dungeon.rows;
      wallRow++
    ) {

      for (
        let startCol = 0;
        startCol <=
        this.dungeon.cols - length;
        startCol++
      ) {

        /*
         * A horizontal physical wall at wallRow
         * separates:
         *
         * row wallRow - 1  [SOUTH face]
         * -----------------------------
         * row wallRow      [NORTH face]
         */


        const wallKeys = [];

        let physicalWallExists =
          true;


        for (
          let i = 0;
          i < length;
          i++
        ) {

          const col =
            startCol + i;


          const key =
            "H:"
            + wallRow
            + ":"
            + col;


          if (
            occupiedWalls.has(key)
          ) {

            physicalWallExists = false;
            break;
          }


          wallKeys.push(key);


          /*
           * Determine whether this physical
           * horizontal wall actually exists.
           */

          if (
            wallRow <
            this.dungeon.rows
          ) {

            const roomBelow =
              this.dungeon.getRoom(
                wallRow,
                col
              );


            if (roomBelow.northDoor) {

              physicalWallExists = false;
              break;
            }
          }

          else {

            /*
             * Bottom dungeon boundary.
             */
            const roomAbove =
              this.dungeon.getRoom(
                wallRow - 1,
                col
              );


            if (roomAbove.southDoor) {

              physicalWallExists = false;
              break;
            }
          }
        }


        if (!physicalWallExists) {
          continue;
        }


        // -----------------------------------------
        // NORTH FACE
        // -----------------------------------------

        if (
          wallRow <
          this.dungeon.rows
          &&
          this.isHorizontalFaceClear(
            wallRow,
            startCol,
            length
          )
        ) {

          candidates.push({
            row: wallRow,
            col: startCol,
            wall: "NORTH",
            length: length,
            wallKeys: wallKeys
          });
        }


        // -----------------------------------------
        // SOUTH FACE
        // -----------------------------------------

        if (
          wallRow > 0
          &&
          this.isHorizontalFaceClear(
            wallRow - 1,
            startCol,
            length
          )
        ) {

          candidates.push({
            row: wallRow - 1,
            col: startCol,
            wall: "SOUTH",
            length: length,
            wallKeys: wallKeys
          });
        }
      }
    }
  }


  findVerticalGraffitiCandidates(
    length,
    occupiedWalls,
    candidates
  ) {

    for (
      let wallCol = 0;
      wallCol <= this.dungeon.cols;
      wallCol++
    ) {

      for (
        let startRow = 0;
        startRow <=
        this.dungeon.rows - length;
        startRow++
      ) {

        /*
         * A vertical physical wall at wallCol
         * separates:
         *
         * WEST-facing room | EAST-facing room
         */


        const wallKeys = [];

        let physicalWallExists =
          true;


        for (
          let i = 0;
          i < length;
          i++
        ) {

          const row =
            startRow + i;


          const key =
            "V:"
            + row
            + ":"
            + wallCol;


          if (
            occupiedWalls.has(key)
          ) {

            physicalWallExists = false;
            break;
          }


          wallKeys.push(key);


          if (
            wallCol <
            this.dungeon.cols
          ) {

            const roomRight =
              this.dungeon.getRoom(
                row,
                wallCol
              );


            if (roomRight.westDoor) {

              physicalWallExists = false;
              break;
            }
          }

          else {

            /*
             * Right dungeon boundary.
             */
            const roomLeft =
              this.dungeon.getRoom(
                row,
                wallCol - 1
              );


            if (roomLeft.eastDoor) {

              physicalWallExists = false;
              break;
            }
          }
        }


        if (!physicalWallExists) {
          continue;
        }


        // -----------------------------------------
        // WEST FACE
        // -----------------------------------------

        if (
          wallCol <
          this.dungeon.cols
          &&
          this.isVerticalFaceClear(
            startRow,
            wallCol,
            length
          )
        ) {

          candidates.push({
            row: startRow,
            col: wallCol,
            wall: "WEST",
            length: length,
            wallKeys: wallKeys
          });
        }


        // -----------------------------------------
        // EAST FACE
        // -----------------------------------------

        if (
          wallCol > 0
          &&
          this.isVerticalFaceClear(
            startRow,
            wallCol - 1,
            length
          )
        ) {

          candidates.push({
            row: startRow,
            col: wallCol - 1,
            wall: "EAST",
            length: length,
            wallKeys: wallKeys
          });
        }
      }
    }
  }

  isHorizontalFaceClear(
    row,
    startCol,
    length
  ) {

    for (
      let i = 0;
      i < length - 1;
      i++
    ) {

      const room =
        this.dungeon.getRoom(
          row,
          startCol + i
        );


      /*
       * A wall between these rooms would
       * physically slice through the mural.
       */
      if (!room.eastDoor) {
        return false;
      }
    }


    return true;
  }


  isVerticalFaceClear(
    startRow,
    col,
    length
  ) {

    for (
      let i = 0;
      i < length - 1;
      i++
    ) {

      const room =
        this.dungeon.getRoom(
          startRow + i,
          col
        );


      if (!room.southDoor) {
        return false;
      }
    }


    return true;
  }

  // =========================================================
  // GRAFFITI PLACEMENT
  // =========================================================
  findCandidates(
    length,
    occupiedWalls
  ) {

    const candidates = [];


    this.findHorizontalGraffitiCandidates(
      length,
      occupiedWalls,
      candidates
    );


    this.findVerticalGraffitiCandidates(
      length,
      occupiedWalls,
      candidates
    );


    return candidates;
  }

}
