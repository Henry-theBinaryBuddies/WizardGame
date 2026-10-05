import {
  DungeonGenerator
} from "./generation/DungeonGenerator.js";

import {
  DungeonPopulator
} from "./generation/DungeonPopulator.js";

import {
  DungeonRenderer
} from "./view/DungeonRenderer.js";

import {
  DungeonDebugRenderer
} from "./view/DungeonDebugRenderer.js";

import {
  Player
} from "./model/Player.js";

import {
  Wizard
} from "./model/Wizard.js";

import {
  AStar
} from "./pathfinding/AStar.js";

import {
  GameController
} from "./controller/GameController.js";


// =========================================================
// GAME SETUP
// =========================================================

const generator =
  new DungeonGenerator(
    10,
    10
  );

const dungeon =
  generator.generateDungeon();


const populator =
  new DungeonPopulator(
    dungeon
  );

populator.populate();

const backgroundMusic = document.getElementById("background-music");

backgroundMusic.volume = 0.3;

function startBackgroundMusic() {
  backgroundMusic.play()
    .then(() => {
      document.removeEventListener("keydown", startBackgroundMusic);
      document.removeEventListener("click", startBackgroundMusic);
    })
    .catch(error => {
      console.log("Audio playback failed:", error);
    });
}

document.addEventListener("keydown", startBackgroundMusic);
document.addEventListener("click", startBackgroundMusic);

// =========================================================
// PLAYER
// =========================================================

const player =
  new Player(
    dungeon.playerStart.row,
    dungeon.playerStart.col
  );


setInitialPlayerDirection();


// =========================================================
// WIZARD
// =========================================================

const wizard =
  new Wizard(
    dungeon.exitPosition.row,
    dungeon.exitPosition.col
  );


// =========================================================
// CONTROLLER
// =========================================================

const pathfinder =
  new AStar();


const controller =
  new GameController(
    dungeon,
    player,
    wizard,
    pathfinder
  );


// =========================================================
// RENDERERS
// =========================================================

const canvas =
  document.getElementById(
    "dungeon-view"
  );


const dungeonRenderer =
  new DungeonRenderer(
    canvas,
    dungeon,
    player,
    wizard
  );


const debugRenderer =
  new DungeonDebugRenderer(
    dungeon,
    player,
    wizard
  );


// =========================================================
// DOM REFERENCES
// =========================================================

const healthDisplay =
  document.getElementById(
    "health-display"
  );


const potionCount =
  document.getElementById(
    "potion-count"
  );


const flowerArtifact =
  document.getElementById(
    "hud-artifact-flower"
  );

const greenPotionArtifact =
  document.getElementById(
    "hud-artifact-green-potion"
  );

const cookiesArtifact =
  document.getElementById(
    "hud-artifact-cookies"
  );

const debugView =
  document.getElementById(
    "debug-view"
  );


const deathOverlay =
  document.getElementById(
    "death-overlay"
  );


const winOverlay =
  document.getElementById(
    "win-overlay"
  );


const playAgainButton =
  document.getElementById(
    "play-again-button"
  );


const winPlayAgainButton =
  document.getElementById(
    "win-play-again-button"
  );

const damageOverlay =
  document.getElementById(
    "damage-overlay"
  );

function flashDamageOverlay() {

  damageOverlay.classList.remove(
    "active"
  );


  // Forces the browser to reset the transition
  void damageOverlay.offsetWidth;


  damageOverlay.classList.add(
    "active"
  );


  setTimeout(
    () => {

      damageOverlay.classList.remove(
        "active"
      );
    },
    150
  );
}


function handlePlayerAction(
  action
) {

  const hpBefore =
    player.hp;


  action();


  const tookDamage =
    player.hp < hpBefore;


  if (
    tookDamage
    &&
    player.hp > 0
  ) {

    flashDamageOverlay();
  }


  updateGameUI();
}



// =========================================================
// GAME STATE
// =========================================================

let deathScreenShown = false;
let winScreenShown = false;


// =========================================================
// INITIAL PLAYER DIRECTION
// =========================================================

function setInitialPlayerDirection() {

  const startRoom =
    dungeon.getRoom(
      player.row,
      player.col
    );


  if (startRoom.eastDoor) {

    player.direction =
      "EAST";

  }
  else {

    player.direction =
      "SOUTH";
  }
}


// =========================================================
// HEALTH HUD
// =========================================================

function updateHealthHUD() {

  healthDisplay.innerHTML = "";


  for (
    let i = 0;
    i < player.maxHp;
    i++
  ) {

    const heart =
      document.createElement(
        "img"
      );


    heart.classList.add(
      "heart"
    );


    heart.src =
      i < player.hp
        ? "assets/images/heart.png"
        : "assets/images/heart_empty.png";


    healthDisplay.appendChild(
      heart
    );
  }
}


// =========================================================
// INVENTORY HUD
// =========================================================

function updateInventoryHUD() {

  potionCount.textContent =
    player.potions;


  flowerArtifact.classList.toggle(
    "collected",
    player.artifacts.includes(
      "FLOWER"
    )
  );

  greenPotionArtifact.classList.toggle(
    "collected",
    player.artifacts.includes(
      "POTION_GREEN"
    )
  );

  cookiesArtifact.classList.toggle(
    "collected",
    player.artifacts.includes(
      "COOKIES"
    )
  );
}


// =========================================================
// END SCREENS
// =========================================================

function showDeathScreen() {

  if (deathScreenShown) {
    return;
  }


  deathScreenShown = true;


  deathOverlay.classList.add(
    "active"
  );
}


function showWinScreen() {

  if (winScreenShown) {
    return;
  }


  winScreenShown = true;


  winOverlay.classList.add(
    "active"
  );
}


// =========================================================
// UI UPDATE
// =========================================================

function updateGameUI() {

  updateHealthHUD();

  updateInventoryHUD();


  // Temporary debug map
  debugView.textContent =
    debugRenderer.render();


  if (controller.gameWon) {

    showWinScreen();

    return;
  }


  if (controller.gameOver) {

    showDeathScreen();
  }
}


// =========================================================
// PLAYER CONTROLS
// =========================================================

//Turn Left Button
document
  .getElementById(
    "turn-left"
  )
  .addEventListener(
    "click",
    () => {

      if (introActive) {
        return;
      }

      controller.turnLeft();

      updateGameUI();
    }
  );

//Move Forward Button
document
  .getElementById(
    "move-forward"
  )
  .addEventListener(
    "click",
    () => {

      if (introActive) {
        return;
      }

      handlePlayerAction(
        () => {
          controller.moveForward();
        }
      );
    }
  );

//Turn Right Button
document
  .getElementById(
    "turn-right"
  )
  .addEventListener(
    "click",
    () => {

      if (introActive) {
        return;
      }

      controller.turnRight();

      updateGameUI();
    }
  );

//Potion Button
document
  .getElementById(
    "use-potion"
  )
  .addEventListener(
    "click",
    () => {

      if (introActive) {
        return;
      }

      controller.usePotion();

      updateGameUI();
    }
  );

// =========================================================
// MOBILE SWIPE CONTROLS
// =========================================================

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
  "touchstart",
  event => {
    touchStartX =
      event.changedTouches[0].clientX;

    touchStartY =
      event.changedTouches[0].clientY;
  }
);

canvas.addEventListener(
  "touchend",
  event => {

    const touchEndX =
      event.changedTouches[0].clientX;

    const touchEndY =
      event.changedTouches[0].clientY;

    const deltaX =
      touchEndX - touchStartX;

    const deltaY =
      touchEndY - touchStartY;

    const minimumSwipeDistance = 50;

    if (
      Math.abs(deltaX) < minimumSwipeDistance
    ) {
      return;
    }

    if (
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) {
      if (introActive) {
        return;
      }
      controller.turnLeft();
    }
    else {
      if (introActive) {
        return;
      }
      controller.turnRight();
    }

    updateGameUI();
  }
);

// =========================================================
// REPLAY BUTTONS
// =========================================================

function restartGame() {

  window.location.reload();
}


playAgainButton.addEventListener(
  "click",
  restartGame
);


winPlayAgainButton.addEventListener(
  "click",
  restartGame
);


// =========================================================
// INTRO OVERLAY
// =========================================================

const introOverlay =
  document.getElementById("intro-overlay");

const introText =
  document.getElementById("intro-text");

const introOk =
  document.getElementById("intro-ok");

let introActive = true;

let introMessage =
  "Welcome to your first day with Hadron Industries! " +
  "To complete your first delivery find the flowers, green potion, and cookies " +
  "then find me before the evil Wizard Rubicon finds you! " +
  "Beware the traps he's laid that will harm you, " +
  "but I've placed potions to restore your health.";

if (
  window.matchMedia(
    "(orientation: portrait)"
  ).matches
) {
  introMessage +=
    " Swipe left or right to turn in the dungeon.";
}

function typeIntroText(
  text,
  index = 0
) {

  if (index >= text.length) {
    introOk.classList.add("visible");
    return;
  }

  introText.textContent +=
    text[index];

  setTimeout(
    () => {
      typeIntroText(
        text,
        index + 1
      );
    },
    30
  );
}

typeIntroText(introMessage);


introOk.addEventListener(
  "click",
  () => {

    introActive = false;

    introOverlay.remove();
  }
);


// =========================================================
// INITIAL UI
// =========================================================

updateGameUI();
