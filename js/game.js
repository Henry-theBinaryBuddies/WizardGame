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

import {
  Leaderboard
} from "./leaderboard.js";


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

const menuButton =
  document.getElementById(
    "menu-button"
  );

const gameMenu =
  document.getElementById(
    "game-menu"
  );

const menuResume =
  document.getElementById(
    "menu-resume"
  );

const leaderboard =
  new Leaderboard();


let runStartTime = null;
let runEndTime = null;

populator.populate();

const backgroundMusic = document.getElementById("background-music");

backgroundMusic.volume = 0.2;

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

const finalTimeDisplay =
  document.getElementById(
    "final-time"
  );

const highScoreEntry =
  document.getElementById(
    "high-score-entry"
  );

const playerInitials =
  document.getElementById(
    "player-initials"
  );

const submitScore =
  document.getElementById(
    "submit-score"
  );

const leaderboardDisplay =
  document.getElementById(
    "leaderboard-display"
  );

const leaderboardList =
  document.getElementById(
    "leaderboard-list"
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
let menuActive = false;
let introActive = true;


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
        ? "assets/images/heart.webp"
        : "assets/images/heart_empty.webp";


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


  playAgainButton.before(leaderboardDisplay);

  deathOverlay.classList.add(
    "active"
  );

  renderLeaderboard();
}


async function showWinScreen() {

  if (winScreenShown) {
    return;
  }

  winScreenShown = true;

  const finalTime =
    getRunTime();

  finalTimeDisplay.textContent =
    `Time: ${formatRunTime(finalTime)}`;

  winOverlay.classList.add(
    "active"
  );

  try {

    const qualifies =
      await leaderboard.qualifies(
        finalTime
      );

    if (qualifies) {

      highScoreEntry.classList.remove(
        "hidden"
      );

      setTimeout(
        () => {
          playerInitials.focus();
        },
        3500
      );
    }
    else {

      await renderLeaderboard();
    }
  }
  catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );

  }
}


// =========================================================
// UI UPDATE
// =========================================================

function updateGameUI() {

  updateHealthHUD();

  updateInventoryHUD();

  if (controller.gameWon) {

    if (runEndTime === null) {
      runEndTime =
        performance.now();
    }

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

      if (introActive || menuActive) {
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

      if (introActive || menuActive) {
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

      if (introActive || menuActive) {
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

      if (introActive || menuActive) {
        return;
      }

      controller.usePotion();

      updateGameUI();
    }
  );

// =========================================================
// MOBILE LONG-PRESS PROTECTION
// =========================================================

document.addEventListener(
  "contextmenu",
  event => {

    if (
      event.target.closest(
        "#game, #menu-button, #game-menu"
      )
    ) {
      event.preventDefault();
    }
  }
);

// =========================================================
// KEYBOARD CONTROLS
// =========================================================

document.addEventListener(
  "keydown",
  event => {

    if (
      introActive
      ||
      menuActive
      ||
      controller.gameWon
      ||
      controller.gameOver
    ) {
      return;
    }


    switch (event.key.toLowerCase()) {

      case "arrowleft":
      case "a":

        event.preventDefault();

        controller.turnLeft();

        updateGameUI();

        break;


      case "arrowup":
      case "w":

        event.preventDefault();

        handlePlayerAction(
          () => {
            controller.moveForward();
          }
        );

        break;


      case "arrowright":
      case "d":

        event.preventDefault();

        controller.turnRight();

        updateGameUI();

        break;


      case "arrowdown":
      case "s":

        event.preventDefault();

        controller.usePotion();

        updateGameUI();

        break;
    }
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
      if (introActive || menuActive) {
        return;
      }
      controller.turnLeft();
    }
    else {
      if (introActive || menuActive) {
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
// SUBMIT HIGH SCORE
// =========================================================

submitScore.addEventListener(
  "click",
  submitHighScore
);


async function submitHighScore() {

  const initials =
    playerInitials.value
      .trim()
      .toUpperCase();

  if (
    initials.length === 0
  ) {
    return;
  }

  submitScore.disabled = true;

  try {

    await leaderboard.addScore(
      initials,
      (
        runEndTime -
        runStartTime
      ) / 1000
    );

    highScoreEntry.classList.add(
      "hidden"
    );

    await renderLeaderboard();
  }
  catch (error) {

    console.error(
      "Score submission failed:",
      error
    );

    submitScore.disabled = false;
  }
}


// =========================================================
// INTRO OVERLAY
// =========================================================

const introOverlay =
  document.getElementById("intro-overlay");

const introText =
  document.getElementById("intro-text");

const introOk =
  document.getElementById("intro-ok");

const introHiva =
  document.getElementById(
    "intro-hiva"
  );

let introMessage =
  "Welcome to Hadron Industries! \n" +
  "Find the flowers, green potion, and cookies, " +
  "then bring them to me before Wizard Rubicon finds you! " +
  "Watch for traps, and use potions to restore your health!";

if (
  window.matchMedia(
    "(orientation: portrait)"
  ).matches
) {
  introMessage +=
    " Swipe left or right to turn in the dungeon.";
}
const HIVA_TALK_SPEED = 200;

let lastHivaMouthChange = 0;
let hivaMouthOpen = false;


function typeIntroText(
  text,
  index = 0
) {

  if (index >= text.length) {

    introHiva.classList.remove(
      "talking"
    );

    introOk.classList.add(
      "visible"
    );

    return;
  }


  introText.textContent +=
    text[index];


  const now =
    performance.now();


  if (
    now - lastHivaMouthChange
    >=
    HIVA_TALK_SPEED
  ) {

    hivaMouthOpen =
      !hivaMouthOpen;

    introHiva.classList.toggle(
      "talking",
      hivaMouthOpen
    );

    lastHivaMouthChange =
      now;
  }


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

    runStartTime =
      performance.now();


    introOverlay.remove();
  }
);


// =========================================================
// GAME MENU
// =========================================================
function openGameMenu() {

  menuActive = true;

  gameMenu.classList.add(
    "open"
  );

  menuButton.textContent = "×";
}


function closeGameMenu() {

  menuActive = false;

  gameMenu.classList.remove(
    "open"
  );

  menuButton.textContent = "☰";
}


menuButton.addEventListener(
  "click",
  () => {

    if (menuActive) {
      closeGameMenu();
    }
    else {
      openGameMenu();
    }
  }
);


menuResume.addEventListener(
  "click",
  closeGameMenu
);

playerInitials.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {
      submitHighScore();
    }
  }
);

// =========================================================
// LEADERBOARD
// =========================================================

function getRunTime() {

  if (
    runStartTime === null
  ) {
    return 0;
  }

  const endTime =
    runEndTime ??
    performance.now();

  return (
    endTime -
    runStartTime
  ) / 1000;
}

function formatRunTime(
  totalSeconds
) {

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    Math.floor(
      totalSeconds % 60
    );

  const hundredths =
    Math.floor(
      (totalSeconds % 1) * 100
    );

  return (
    String(minutes)
      .padStart(2, "0")
    +
    ":"
    +
    String(seconds)
      .padStart(2, "0")
    +
    "."
    +
    String(hundredths)
      .padStart(2, "0")
  );
}

async function renderLeaderboard() {

  try {

    const scores =
      await leaderboard.getScores();

    leaderboardList.innerHTML = "";

    for (const score of scores) {

      const entry =
        document.createElement(
          "li"
        );

      entry.textContent =
        `${score.name} — ${formatRunTime(score.time)}`;

      leaderboardList.appendChild(
        entry
      );
    }

    leaderboardDisplay.classList.remove(
      "hidden"
    );
  }
  catch (error) {

    console.error(
      "Unable to load leaderboard:",
      error
    );
  }
}


// =========================================================
// INITIAL UI
// =========================================================

updateGameUI();
