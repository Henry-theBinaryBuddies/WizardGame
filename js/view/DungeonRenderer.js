import {
  GraffitiGenerator
} from "../generation/GraffitiGenerator.js";

import {
  TextureManager
} from "./TextureManager.js";

import {
  Camera
} from "./Camera.js";

import {
  MatrixMath
} from "./webgl/MatrixMath.js";

import {
  GeometryBuilder
} from "./webgl/GeometryBuilder.js";

import {
  DungeonGeometryBuilder
} from "./webgl/DungeonGeometryBuilder.js";

import {
  SpriteRenderer
} from "./webgl/SpriteRenderer.js";

import {
  WebGLProgram
} from "./webgl/WebGLProgram.js";

export class DungeonRenderer {

  constructor(canvas, dungeon, player, wizard) {
    this.canvas = canvas;
    this.dungeon = dungeon;
    this.player = player;
    this.wizard = wizard;

    this.animationTime = 0;
    this.exitAnimationFrame = 0;
    this.exitAnimationLastTime = 0;
    this.exitAnimationSpeed = 400;

    this.graffitiPlacements = [];

    // =========================================================
    // WEBGL CONTEXT
    // =========================================================

    this.gl =
      this.canvas.getContext("webgl");

    if (!this.gl) {
      throw new Error(
        "WebGL is not supported by this browser."
      );
    }


    this.textureManager =
      new TextureManager(
        this.gl
      );

    // =========================================================
    // WEBGL PROGRAM
    // =========================================================

    this.webGLProgram =
      new WebGLProgram(
        this.gl
      );


    // =========================================================
    // STATIC GEOMETRY BUFFERS
    // =========================================================

    this.wallBuffer = null;
    this.floorBuffer = null;
    this.ceilingBuffer = null;

    this.wallVertexCount = 0;
    this.floorVertexCount = 0;
    this.ceilingVertexCount = 0;


    // =========================================================
    // DYNAMIC SPRITE BUFFER
    // =========================================================
    this.spriteBuffer =
      this.gl.createBuffer();

    this.camera =
      new Camera(
        this.player
      );

    this.lastFrameTime = null;


    this.initialize();

    this.startAnimationLoop();
  }


  // =========================================================
  // INITIALIZATION
  // =========================================================

  initialize() {
    this.initializeWebGL();

    this.webGLProgram.initialize();

    this.createBuffers();

    this.buildDungeonGeometry();

    const graffitiGenerator =
      new GraffitiGenerator(
        this.dungeon
      );

    this.graffitiPlacements =
      graffitiGenerator.generate();

    this.textureManager.loadAll();
  }


  initializeWebGL() {
    const gl = this.gl;

    gl.enable(
      gl.DEPTH_TEST
    );

    gl.depthFunc(
      gl.LEQUAL
    );

    /*
     * We are inside the dungeon, so do not
     * discard back-facing polygons.
     */
    gl.disable(
      gl.CULL_FACE
    );

    gl.clearColor(
      0.03,
      0.04,
      0.03,
      1.0
    );
  }

  // =========================================================
  // BUFFERS
  // =========================================================

  createBuffers() {
    const gl = this.gl;


    this.wallBuffer =
      gl.createBuffer();


    this.floorBuffer =
      gl.createBuffer();


    this.ceilingBuffer =
      gl.createBuffer();

    this.spriteRenderer =
      new SpriteRenderer(
        this.gl,
        this.spriteBuffer,
        this.webGLProgram.drawBuffer.bind(this.webGLProgram),
        this.getForwardVector.bind(this)
      );
  }


  // =========================================================
  // BUILD DUNGEON GEOMETRY
  // =========================================================

  buildDungeonGeometry() {

    const geometryBuilder =
      new DungeonGeometryBuilder(
        this.dungeon
      );


    const geometry =
      geometryBuilder.build();


    this.webGLProgram.uploadStaticBuffer(
      this.wallBuffer,
      geometry.walls
    );


    this.webGLProgram.uploadStaticBuffer(
      this.floorBuffer,
      geometry.floors
    );


    this.webGLProgram.uploadStaticBuffer(
      this.ceilingBuffer,
      geometry.ceilings
    );

    this.wallVertexCount =
      geometry.walls.length / 5;

    this.floorVertexCount =
      geometry.floors.length / 5;

    this.ceilingVertexCount =
      geometry.ceilings.length / 5;
  }

  // =========================================================
  // MAIN RENDER
  // =========================================================

  render() {

    this.resizeCanvas();

    const gl = this.gl;

    gl.viewport(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    gl.clear(
      gl.COLOR_BUFFER_BIT
      |
      gl.DEPTH_BUFFER_BIT
    );

    gl.useProgram(
      this.webGLProgram.program
    );

    const aspect =
      this.canvas.width
      /
      this.canvas.height;

    const projection =
      MatrixMath.createPerspective(
        MatrixMath.degreesToRadians(
          70
        ),
        aspect,
        0.05,
        30
      );

    const view =
      this.createViewMatrix();

    gl.uniformMatrix4fv(
      this.webGLProgram.projectionLocation,
      false,
      projection
    );

    gl.uniformMatrix4fv(
      this.webGLProgram.viewLocation,
      false,
      view
    );

    gl.uniform1i(
      this.webGLProgram.samplerLocation,
      0
    );

    gl.uniform1f(
      this.webGLProgram.fogStartLocation,
      1.0
    );

    gl.uniform1f(
      this.webGLProgram.fogEndLocation,
      5.5
    );

    gl.uniform3f(
      this.webGLProgram.fogColorLocation,
      0.03,
      0.04,
      0.03
    );

    // ---------------------------------------------------------
    // FLOOR
    // ---------------------------------------------------------
    this.webGLProgram.drawBuffer(
      this.floorBuffer,
      this.floorVertexCount,
      this.textureManager.get("floor")
    );


    // ---------------------------------------------------------
    // CEILING
    // ---------------------------------------------------------
    this.webGLProgram.drawBuffer(
      this.ceilingBuffer,
      this.ceilingVertexCount,
      this.textureManager.get("ceiling")
    );

    // ---------------------------------------------------------
    // WALLS
    // ---------------------------------------------------------
    this.webGLProgram.drawBuffer(
      this.wallBuffer,
      this.wallVertexCount,
      this.textureManager.get("wall")
    );

    // ---------------------------------------------------------
// GRAFFITI
// ---------------------------------------------------------

    for (
      const graffiti
      of this.graffitiPlacements
      ) {

      const texture =
        this.textureManager.get(
          graffiti.texture
        );


      if (texture) {
        this.drawWallGraffiti(
          graffiti.row,
          graffiti.col,
          graffiti.wall,
          graffiti.length,
          texture
        );
      }
    }

    // ---------------------------------------------------------
    // ROOM OBJECTS
    // ---------------------------------------------------------

    this.drawRoomObjects();


    // ---------------------------------------------------------
    // EXIT SPRITE, HIVA
    // ---------------------------------------------------------
    this.drawExitSprite();


    // ---------------------------------------------------------
    // WIZARD
    // ---------------------------------------------------------

    this.drawWizard();
  }

  getArtifactTexture(
    artifact
  ) {

    switch (artifact) {

      case "FLOWER":
        return this.textureManager.get(
          "flower"
        );

      case "POTION_GREEN":
        return this.textureManager.get(
          "green_potion"
        );

      case "COOKIES":
        return this.textureManager.get(
          "cookies"
        );

      default:
        return null;
    }
  }


  // =========================================================
  // ROOM OBJECTS
  // =========================================================
  drawRoomObjects() {

    for (
      let row = 0;
      row < this.dungeon.rows;
      row++
    ) {

      for (
        let col = 0;
        col < this.dungeon.cols;
        col++
      ) {

        const room =
          this.dungeon.getRoom(
            row,
            col
          );

        // Poster
        if (room.poster !== null) {

          const texture =
            this.textureManager.get(
              room.poster.type
            );

          this.drawWallPoster(
            row,
            col,
            room.poster.wall,
            texture
          );
        }


        // Artifacts
        if (
          room.hasArtifact()
        ) {

          const texture =
            this.getArtifactTexture(
              room.artifact
            );


          this.spriteRenderer
            .drawFloatingBillboardSprite(
              row,
              col,
              texture,
              0.40,
              0.40,
              this.animationTime
            );
        }

        // Potion
        if (room.hasPotion) {

          this.spriteRenderer
            .drawFloatingBillboardSprite(
              row,
              col,
              this.textureManager.get(
                "potion"
              ),
              0.30,
              0.35,
              this.animationTime
            );
        }


        // Trap
        if (
          room.hasTrap
          &&
          !room.trapTriggered
        ) {

          this.spriteRenderer
            .drawFloorSprite(
              row,
              col,
              this.textureManager.get(
                "trap"
              ),
              0.65
            );
        }
      }
    }
  }

  // =========================================================
  // WALL DECORATIONS
  // =========================================================
  getWallPlane(
    row,
    col,
    wall,
    offset
  ) {

    switch (wall) {

      case "NORTH":
        return {
          axis: "Z",
          position: row + offset,
          direction: 1
        };

      case "SOUTH":
        return {
          axis: "Z",
          position: row + 1 - offset,
          direction: -1
        };

      case "WEST":
        return {
          axis: "X",
          position: col + offset,
          direction: -1
        };

      case "EAST":
        return {
          axis: "X",
          position: col + 1 - offset,
          direction: 1
        };

      default:
        return null;
    }
  }

  drawWallPoster(
    row,
    col,
    wall,
    texture
  ) {

    if (!texture) {
      return;
    }


    const width = 0.55;
    const height = 0.65;

    const halfWidth =
      width / 2;

    const centerY = 0.52;

    const bottom =
      centerY - height / 2;

    const top =
      centerY + height / 2;


    // Prevent z-fighting with wall.
    const offset = 0.005;


    const centerX =
      col + 0.5;

    const centerZ =
      row + 0.5;


    const vertices = [];


    const plane =
      this.getWallPlane(
        row,
        col,
        wall,
        offset
      );


    if (!plane) {
      return;
    }


    if (plane.axis === "Z") {

      const leftX =
        centerX
        -
        halfWidth * plane.direction;

      const rightX =
        centerX
        +
        halfWidth * plane.direction;


      GeometryBuilder.addQuad(
        vertices,

        [
          leftX,
          bottom,
          plane.position
        ],

        [
          rightX,
          bottom,
          plane.position
        ],

        [
          rightX,
          top,
          plane.position
        ],

        [
          leftX,
          top,
          plane.position
        ]
      );

    } else {

      const firstZ =
        centerZ
        -
        halfWidth * plane.direction;

      const secondZ =
        centerZ
        +
        halfWidth * plane.direction;


      GeometryBuilder.addQuad(
        vertices,

        [
          plane.position,
          bottom,
          firstZ
        ],

        [
          plane.position,
          bottom,
          secondZ
        ],

        [
          plane.position,
          top,
          secondZ
        ],

        [
          plane.position,
          top,
          firstZ
        ]
      );
    }


    this.spriteRenderer
      .uploadDynamicSprite(
        vertices,
        texture
      );
  }

  drawWallGraffiti(
    row,
    col,
    wall,
    length,
    texture
  ) {

    if (!texture) {
      return;
    }


    const vertices = [];

    const bottom = 0.08;
    const top = 0.92;

    // Behind posters, but in front of wall.
    const offset = 0.003;


    const plane =
      this.getWallPlane(
        row,
        col,
        wall,
        offset
      );


    if (!plane) {
      return;
    }


    for (
      let segment = 0;
      segment < length;
      segment++
    ) {

      const uMin =
        segment / length;

      const uMax =
        (segment + 1) / length;


      /*
       * SOUTH and WEST traverse their wall
       * geometry in the opposite direction.
       */
      const reversed =
        plane.direction === -1;


      const segmentUMin =
        reversed
          ? 1 - uMax
          : uMin;

      const segmentUMax =
        reversed
          ? 1 - uMin
          : uMax;


      if (plane.axis === "Z") {

        const segmentCol =
          col + segment;

        const startX =
          segmentCol;

        const endX =
          segmentCol + 1;


        const firstX =
          plane.direction === 1
            ? startX
            : endX;

        const secondX =
          plane.direction === 1
            ? endX
            : startX;


        GeometryBuilder.addQuadWithUV(
          vertices,

          [
            firstX,
            bottom,
            plane.position
          ],

          [
            secondX,
            bottom,
            plane.position
          ],

          [
            secondX,
            top,
            plane.position
          ],

          [
            firstX,
            top,
            plane.position
          ],

          segmentUMin,
          segmentUMax
        );

      } else {

        const segmentRow =
          row + segment;

        const startZ =
          segmentRow;

        const endZ =
          segmentRow + 1;


        /*
         * WEST has direction -1 and therefore
         * traverses high Z to low Z.
         * EAST traverses low Z to high Z.
         */
        const firstZ =
          plane.direction === -1
            ? endZ
            : startZ;

        const secondZ =
          plane.direction === -1
            ? startZ
            : endZ;


        GeometryBuilder.addQuadWithUV(
          vertices,

          [
            plane.position,
            bottom,
            firstZ
          ],

          [
            plane.position,
            bottom,
            secondZ
          ],

          [
            plane.position,
            top,
            secondZ
          ],

          [
            plane.position,
            top,
            firstZ
          ],

          segmentUMin,
          segmentUMax
        );
      }
    }

    this.spriteRenderer
      .uploadDynamicSprite(
        vertices,
        texture
      );
  }


  // =========================================================
  // EXIT SPRITE
  // =========================================================
  drawExitSprite() {

    const row =
      this.dungeon.exitPosition.row;

    const col =
      this.dungeon.exitPosition.col;


    this.spriteRenderer
      .drawAnimatedBillboardSprite(
        row,
        col,
        this.textureManager.get(
          "exit"
        ),
        0.45,
        0.60,
        this.exitAnimationFrame,
        2
      );
  }

  startAnimationLoop() {

    const animate = (
      timestamp
    ) => {

      // -----------------------------------------
      // FRAME TIMING
      // -----------------------------------------

      if (
        this.lastFrameTime === null
      ) {

        this.lastFrameTime =
          timestamp;
      }


      const deltaTime =
        timestamp
        - this.lastFrameTime;


      this.lastFrameTime =
        timestamp;


      // -----------------------------------------
      // CAMERA ANIMATION
      // -----------------------------------------
      this.camera.update(
        deltaTime
      );


      // -----------------------------------------
      // GENERAL ANIMATION TIME
      // -----------------------------------------

      this.animationTime =
        timestamp;


      // -----------------------------------------
      // EXIT NPC ANIMATION
      // -----------------------------------------

      if (
        timestamp
        -
        this.exitAnimationLastTime
        >=
        this.exitAnimationSpeed
      ) {

        this.exitAnimationFrame =
          (
            this.exitAnimationFrame + 1
          )
          %
          2;


        this.exitAnimationLastTime =
          timestamp;
      }


      // -----------------------------------------
      // RENDER FRAME
      // -----------------------------------------

      this.render();


      requestAnimationFrame(
        animate
      );
    };


    requestAnimationFrame(
      animate
    );
  }

  // =========================================================
  // WIZARD
  // =========================================================
  drawWizard() {

    this.spriteRenderer
      .drawBillboardSprite(
        this.wizard.row,
        this.wizard.col,
        this.textureManager.get(
          "wizard"
        ),
        0.55,
        0.85
      );
  }

  // =========================================================
  // CAMERA
  // =========================================================
  createViewMatrix() {
    const eye = [
      this.camera.x,
      0.5,
      this.camera.z
    ];

    const forwardX =
      Math.sin(
        this.camera.angle
      );

    const forwardZ =
      -Math.cos(
        this.camera.angle
      );

    const target = [
      eye[0] + forwardX,
      eye[1],
      eye[2] + forwardZ
    ];

    const up = [0, 1, 0];

    return MatrixMath.createLookAt(eye, target, up);
  }


  getForwardVector() {
    switch (this.player.direction) {
      case "NORTH":
        return {x: 0, z: -1};

      case "EAST":
        return {x: 1, z: 0};

      case "SOUTH":
        return {x: 0, z: 1};


      case "WEST":
        return {x: -1, z: 0};

      default:
        return {x: 0, z: -1};
    }
  }

  resizeCanvas() {
    const pixelRatio =
      Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth = Math.floor(
        this.canvas.clientWidth
        *
        pixelRatio
      );

    const displayHeight =
      Math.floor(
        this.canvas.clientHeight
        *
        pixelRatio
      );

    if (
      this.canvas.width
      !==
      displayWidth
      ||
      this.canvas.height
      !==
      displayHeight
    ) {

      this.canvas.width =
        displayWidth;

      this.canvas.height =
        displayHeight;
    }
  }
}
