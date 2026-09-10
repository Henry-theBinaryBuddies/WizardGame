export class AStar {

  findPath(dungeon, start, goal) {
    const openSet = [start];

    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey =
      `${start.row},${start.col}`;

    gScore.set(startKey, 0);

    fScore.set(
      startKey,
      this.heuristic(start, goal)
    );

    while (openSet.length > 0) {

      let current = openSet[0];

      for (const position of openSet) {
        const currentKey =
          `${current.row},${current.col}`;

        const positionKey =
          `${position.row},${position.col}`;

        if (
          fScore.get(positionKey)
          <
          fScore.get(currentKey)
        ) {
          current = position;
        }
      }

      if (
        current.row === goal.row
        &&
        current.col === goal.col
      ) {
        return this.reconstructPath(
          cameFrom,
          current
        );
      }

      const currentIndex =
        openSet.findIndex(
          position =>
            position.row === current.row
            &&
            position.col === current.col
        );

      openSet.splice(currentIndex, 1);

      for (
        const neighbor
        of this.getNeighbors(
        dungeon,
        current
      )
        ) {
        const currentKey =
          `${current.row},${current.col}`;

        const neighborKey =
          `${neighbor.row},${neighbor.col}`;

        const tentativeGScore =
          gScore.get(currentKey) + 1;

        const existingGScore =
          gScore.get(neighborKey);

        if (
          existingGScore === undefined
          ||
          tentativeGScore < existingGScore
        ) {
          cameFrom.set(
            neighborKey,
            current
          );

          gScore.set(
            neighborKey,
            tentativeGScore
          );

          fScore.set(
            neighborKey,
            tentativeGScore
            +
            this.heuristic(
              neighbor,
              goal
            )
          );

          const alreadyOpen =
            openSet.some(
              position =>
                position.row === neighbor.row
                &&
                position.col === neighbor.col
            );

          if (!alreadyOpen) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return [];
  }

  getNeighbors(dungeon, position) {
    const room =
      dungeon.getRoom(
        position.row,
        position.col
      );

    const neighbors = [];

    if (room.northDoor) {
      neighbors.push({
        row: position.row - 1,
        col: position.col
      });
    }

    if (room.southDoor) {
      neighbors.push({
        row: position.row + 1,
        col: position.col
      });
    }

    if (room.eastDoor) {
      neighbors.push({
        row: position.row,
        col: position.col + 1
      });
    }

    if (room.westDoor) {
      neighbors.push({
        row: position.row,
        col: position.col - 1
      });
    }

    return neighbors;
  }

  heuristic(a, b) {
    return (
      Math.abs(a.row - b.row)
      +
      Math.abs(a.col - b.col)
    );
  }

  reconstructPath(cameFrom, current) {
    const path = [current];

    let currentKey =
      `${current.row},${current.col}`;

    while (cameFrom.has(currentKey)) {
      current =
        cameFrom.get(currentKey);

      path.unshift(current);

      currentKey =
        `${current.row},${current.col}`;
    }

    return path;
  }
}
