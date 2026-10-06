class AudioManager {
  static sounds = {
      artifact: new Audio("./assets/sfx/artifact.mp3"),
      potionPickup: new Audio("./assets/sfx/treasure.mp3"),
      heal: new Audio("./assets/sfx/heal.mp3"),
      trap: new Audio("./assets/sfx/pit.mp3"),
      wizard: new Audio("./assets/sfx/evil laugh.mp3"),
      wizard2: new Audio("./assets/sfx/laugh 3.mp3"),
      step: new Audio("./assets/sfx/step.mp3"),
      victory: new Audio("./assets/sfx/great job.mp3")
    };

  static volume = 0.7;

  static play(soundName) {
    const sound = this.sounds[soundName];

    if (!sound) {
      console.warn(`Unknown sound: ${soundName}`);
      return;
    }

    sound.volume = this.volume;
    sound.currentTime = 0;
    sound.play();
  }
}

export default AudioManager;
