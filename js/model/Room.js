export class Room {

  constructor() {
    // Room connectivity
    this.northDoor = false;
    this.southDoor = false;
    this.eastDoor = false;
    this.westDoor = false;

    // Room contents
    this.hasTrap = false;
    this.trapTriggered = false;

    this.artifact = null;
    this.hasPotion = false;
    this.isExit = false;

    this.poster = null;
  }

  openNorthDoor() {
    this.northDoor = true;
  }

  openSouthDoor() {
    this.southDoor = true;
  }

  openEastDoor() {
    this.eastDoor = true;
  }

  openWestDoor() {
    this.westDoor = true;
  }

  triggerTrap() {
    if (!this.hasTrap || this.trapTriggered) {
      return false;
    }

    this.trapTriggered = true;
    return true;
  }

  removeArtifact() {
    const artifact = this.artifact;
    this.artifact = null;

    return artifact;
  }

  hasArtifact() {
    return this.artifact !== null;
  }
}
