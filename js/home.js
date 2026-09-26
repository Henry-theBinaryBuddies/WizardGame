const music = document.getElementById("background-music");

function startMusic() {
  music.volume = 0.5;

  music.play().catch(error => {
    console.log("Audio playback failed:", error);
  });

  document.removeEventListener("click", startMusic);
  document.removeEventListener("keydown", startMusic);
}

document.addEventListener("click", startMusic);
document.addEventListener("keydown", startMusic);
