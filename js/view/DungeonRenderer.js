export class DungeonRenderer {

  constructor(dungeon, player, wizard) {
    this.dungeon = dungeon;
    this.player = player;
    this.wizard = wizard;

    this.assetPath = "assets/images/";
  }


  render() {
    const room =
      this.dungeon.getRoom(
        this.player.row,
        this.player.col
      );

    const directions =
      this.getViewDirections();

    const forwardOpen =
      this.isOpen(
        room,
        directions.forward
      );

    const leftOpen =
      this.isOpen(
        room,
        directions.left
      );

    const rightOpen =
      this.isOpen(
        room,
        directions.right
      );

    const background =
      this.getBackgroundImage(
        forwardOpen,
        leftOpen,
        rightOpen
      );

    const wizard =
      this.renderWizard(
        directions.forward,
        forwardOpen
      );

    return `
      <div class="dungeon-scene">

        <img
          class="dungeon-background"
          src="${this.assetPath}${background}"
          alt=""
        >

        ${wizard}

      </div>
    `;
  }


  getViewDirections() {
    switch (this.player.direction) {

      case "NORTH":
        return {
          forward: "north",
          left: "west",
          right: "east"
        };

      case "EAST":
        return {
          forward: "east",
          left: "north",
          right: "south"
        };

      case "SOUTH":
        return {
          forward: "south",
          left: "east",
          right: "west"
        };

      case "WEST":
        return {
          forward: "west",
          left: "south",
          right: "north"
        };

      default:
        throw new Error(
          `Invalid player direction: ${this.player.direction}`
        );
    }
  }


  isOpen(room, direction) {
    switch (direction) {

      case "north":
        return room.northDoor;

      case "south":
        return room.southDoor;

      case "east":
        return room.eastDoor;

      case "west":
        return room.westDoor;

      default:
        return false;
    }
  }


  getBackgroundImage(
    forwardOpen,
    leftOpen,
    rightOpen
  ) {

    if (
      forwardOpen
      && leftOpen
      && rightOpen
    ) {
      return "both_openings.png";
    }

    if (
      forwardOpen
      && leftOpen
    ) {
      return "left_opening.png";
    }

    if (
      forwardOpen
      && rightOpen
    ) {
      return "right_opening.png";
    }

    if (forwardOpen) {
      return "open_corridor.png";
    }

    if (
      !forwardOpen
      && leftOpen
      && rightOpen
    ) {
      return "t_intersection.png";
    }

    if (
      !forwardOpen
      && leftOpen
    ) {
      return "corner_left.png";
    }

    if (
      !forwardOpen
      && rightOpen
    ) {
      return "corner_right.png";
    }

    return "dead_end_wall.png";
  }


  renderWizard(
    forwardDirection,
    forwardOpen
  ) {
    if (!forwardOpen) {
      return "";
    }

    const nextPosition =
      this.getNextPosition(
        this.player.row,
        this.player.col,
        forwardDirection
      );

    if (nextPosition === null) {
      return "";
    }

    if (
      nextPosition.row === this.wizard.row
      &&
      nextPosition.col === this.wizard.col
    ) {
      return `
        <img
          class="wizard wizard-near"
          src="${this.assetPath}wizard_near.png"
          alt="Wizard"
        >
      `;
    }

    return "";
  }


  getNextPosition(
    row,
    col,
    direction
  ) {
    let nextRow = row;
    let nextCol = col;

    switch (direction) {

      case "north":
        nextRow--;
        break;

      case "south":
        nextRow++;
        break;

      case "east":
        nextCol++;
        break;

      case "west":
        nextCol--;
        break;

      default:
        return null;
    }

    if (
      !this.dungeon.inBounds(
        nextRow,
        nextCol
      )
    ) {
      return null;
    }

    return {
      row: nextRow,
      col: nextCol
    };
  }
}
