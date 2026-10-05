export class Camera {

  constructor(player) {

    this.player = player;

    // =========================================================
    // CAMERA ANIMATION
    // =========================================================
    this.x =
      this.player.col + 0.5;

    this.z =
      this.player.row + 0.5;

    this.angle =
      this.directionToAngle(
        this.player.direction
      );


    this.targetX =
      this.x;

    this.targetZ =
      this.z;

    this.targetAngle =
      this.angle;


    this.moveSpeed = 0.012;
    this.turnSpeed = 0.012;
  }


  update(deltaTime) {

    this.targetX =
      this.player.col + 0.5;

    this.targetZ =
      this.player.row + 0.5;

    this.targetAngle =
      this.directionToAngle(
        this.player.direction
      );


    const moveAmount =
      Math.min(
        1,
        deltaTime
        * this.moveSpeed
      );


    this.x +=
      (
        this.targetX
        - this.x
      )
      * moveAmount;


    this.z +=
      (
        this.targetZ
        - this.z
      )
      * moveAmount;


    /*
     * Find shortest rotational distance.
     */
    let angleDifference =
      this.targetAngle
      - this.angle;


    angleDifference =
      Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
      );


    const turnAmount =
      Math.min(
        1,
        deltaTime
        * this.turnSpeed
      );


    this.angle +=
      angleDifference
      * turnAmount;
  }


  directionToAngle(
    direction
  ) {

    switch (direction) {

      case "NORTH":
        return 0;

      case "EAST":
        return Math.PI / 2;

      case "SOUTH":
        return Math.PI;

      case "WEST":
        return -Math.PI / 2;

      default:
        return 0;
    }
  }
}
