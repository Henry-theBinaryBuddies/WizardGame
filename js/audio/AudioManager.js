class AudioManager {
  static sounds = {
      artifact: new Audio("./assets/sfx/artifact.wav"),
      potionPickup: new Audio("./assets/sfx/treasure.wav"),
      heal: new Audio("./assets/sfx/heal.wav"),
      trap: new Audio("./assets/sfx/pit.wav"),
      wizard: new Audio("./assets/sfx/evil laugh.wav"),
      wizard2: new Audio("./assets/sfx/laugh 3.wav"),
      step: new Audio("./assets/sfx/step.wav"),
      victory: new Audio("./assets/sfx/great job.wav")
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
