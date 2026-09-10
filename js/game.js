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

import { Wizard } from "./model/Wizard.js";

import { AStar } from "./pathfinding/AStar.js";

import {
  GameController
} from "./controller/GameController.js";


// Generate dungeon
const generator =
  new DungeonGenerator(10, 10);

const dungeon =
  generator.generateDungeon();

// Populate dungeon
const populator =
  new DungeonPopulator(dungeon);

populator.populate();


// Create player at dungeon start
const player =
  new Player(
    dungeon.playerStart.row,
    dungeon.playerStart.col
  );

// Create Wizard at dungeon exit
const wizard =
  new Wizard(
    dungeon.exitPosition.row,
    dungeon.exitPosition.col
  );

const pathfinder =
  new AStar();

// Create controller
const controller =
  new GameController(dungeon, player, wizard, pathfinder);

const canvas =
  document.getElementById("dungeon-view");

// Create debug renderer
const debugRenderer =
  new DungeonDebugRenderer(
    dungeon,
    player,
    wizard
  );

//3d render
const dungeonRenderer =
  new DungeonRenderer(
    canvas,
    dungeon,
    player,
    wizard
  );


// Render current game state
function render() {

  dungeonRenderer.render();

  document
    .getElementById("debug-view")
    .textContent =
    debugRenderer.render();

  document
    .getElementById("health")
    .textContent =
    `HP: ${player.hp}`;

  document
    .getElementById("keys")
    .textContent =
    `Artifacts: ${player.artifacts} / 3`;

  document
    .getElementById("potions")
    .textContent =
    `Potions: ${player.potions}`;

  const status =
    document.getElementById("status");

  if (controller.gameWon) {
    status.textContent =
      "You escaped the dungeon!";
  } else if (controller.gameOver) {
    status.textContent =
      "You died.";
  } else {
    status.textContent =
      "Explore the dungeon.";
  }
}

//TEMPORARY FOR DEBUGGING
console.log(
  "HP:", player.hp,
  "Artifacts:", player.artifacts,
  "Game Over:", controller.gameOver,
  "Game Won:", controller.gameWon
);

// Button controls
document
  .getElementById("turn-left")
  .addEventListener("click", () => {
    controller.turnLeft();
    render();
  });

document
  .getElementById("move-forward")
  .addEventListener("click", () => {
    controller.moveForward();
    render();
  });

document
  .getElementById("turn-right")
  .addEventListener("click", () => {
    controller.turnRight();
    render();
  });

document
  .getElementById("use-potion")
  .addEventListener("click", () => {
    controller.usePotion();
    render();
  });


// Initial render
render();

