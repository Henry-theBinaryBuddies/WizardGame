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


    // =========================================================
    // TEXTURE PATHS
    // =========================================================

    this.texturePaths = {
      wall: "assets/images/wall_texture.png",
      floor: "assets/images/floor_texture.png",
      ceiling: "assets/images/ceiling_texture.png",
      wizard: "assets/images/wizard.png",

      cookies: "assets/images/cookies.png",
      flower: "assets/images/flower.png",
      green_potion: "assets/images/green_potion.png",

      potion: "assets/images/potion.png",
      trap: "assets/images/trap.png",
      exit: "assets/images/HIVA.png"
    };


    // =========================================================
    // SHADER STATE
    // =========================================================

    this.program = null;

    this.positionLocation = null;
    this.textureLocation = null;

    this.projectionLocation = null;
    this.viewLocation = null;
    this.samplerLocation = null;


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


    // =========================================================
    // TEXTURES
    // =========================================================

    this.wallTexture = null;
    this.floorTexture = null;
    this.ceilingTexture = null;

    this.wizardTexture = null;

    this.flowerTexture = null;
    this.greenPotionTexture = null;
    this.cookiesTexture = null;

    this.potionTexture = null;
    this.trapTexture = null;
    this.exitTexture = null;

    // =========================================================
// CAMERA ANIMATION
// =========================================================

    this.cameraX =
      this.player.col + 0.5;

    this.cameraZ =
      this.player.row + 0.5;

    this.cameraAngle =
      this.directionToAngle(
        this.player.direction
      );

    this.targetCameraX =
      this.cameraX;

    this.targetCameraZ =
      this.cameraZ;

    this.targetCameraAngle =
      this.cameraAngle;

    this.cameraMoveSpeed = 0.012;
    this.cameraTurnSpeed = 0.012;

    this.lastFrameTime = null;


    this.initialize();

    this.startAnimationLoop();
  }


  // =========================================================
  // INITIALIZATION
  // =========================================================

  initialize() {
    this.initializeWebGL();

    this.program =
      this.createShaderProgram();

    this.getShaderLocations();

    this.createBuffers();

    this.buildDungeonGeometry();

    this.loadTextures();
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
  // SHADERS
  // =========================================================

  createShaderProgram() {
    const gl = this.gl;

    const vertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;

  uniform mat4 u_projection;
  uniform mat4 u_view;

  varying vec2 v_texCoord;
  varying vec3 v_viewPosition;

  void main() {

    vec4 viewPosition =
      u_view
      * vec4(
          a_position,
          1.0
        );

    gl_Position =
      u_projection
      * viewPosition;

    v_texCoord =
      a_texCoord;

    v_viewPosition =
      viewPosition.xyz;
  }
`;


    const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_texture;

  uniform float u_fogStart;
  uniform float u_fogEnd;
  uniform vec3 u_fogColor;

  varying vec2 v_texCoord;
  varying vec3 v_viewPosition;

  void main() {

    vec4 color =
      texture2D(
        u_texture,
        v_texCoord
      );


    // Ignore transparent sprite pixels.
    if (color.a < 0.1) {
      discard;
    }


    float distanceFromCamera =
      length(
        v_viewPosition
      );


    float fogAmount =
      smoothstep(
        u_fogStart,
        u_fogEnd,
        distanceFromCamera
      );


    // Objects become darker as they recede.
    float brightness =
      mix(
        1.0,
        0.40,
        fogAmount
      );


    vec3 darkenedColor =
      color.rgb
      * brightness;


    // Blend distant objects toward the dungeon fog color.
    vec3 finalColor =
      mix(
        darkenedColor,
        u_fogColor,
        fogAmount * 0.80
      );


    gl_FragColor =
      vec4(
        finalColor,
        color.a
      );
  }
`;


    const vertexShader =
      this.compileShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
      );


    const fragmentShader =
      this.compileShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );


    const program =
      gl.createProgram();


    gl.attachShader(
      program,
      vertexShader
    );


    gl.attachShader(
      program,
      fragmentShader
    );


    gl.linkProgram(
      program
    );


    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
      )
    ) {
      throw new Error(
        "Could not link WebGL program: "
        + gl.getProgramInfoLog(
          program
        )
      );
    }


    return program;
  }


  compileShader(type, source) {
    const gl = this.gl;

    const shader =
      gl.createShader(type);


    gl.shaderSource(
      shader,
      source
    );


    gl.compileShader(
      shader
    );


    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
      )
    ) {
      throw new Error(
        "Could not compile WebGL shader: "
        + gl.getShaderInfoLog(
          shader
        )
      );
    }


    return shader;
  }


  getShaderLocations() {
    const gl = this.gl;


    this.positionLocation =
      gl.getAttribLocation(
        this.program,
        "a_position"
      );


    this.textureLocation =
      gl.getAttribLocation(
        this.program,
        "a_texCoord"
      );


    this.projectionLocation =
      gl.getUniformLocation(
        this.program,
        "u_projection"
      );


    this.viewLocation =
      gl.getUniformLocation(
        this.program,
        "u_view"
      );


    this.samplerLocation =
      gl.getUniformLocation(
        this.program,
        "u_texture"
      );

    this.fogStartLocation =
      gl.getUniformLocation(
        this.program,
        "u_fogStart"
      );


    this.fogEndLocation =
      gl.getUniformLocation(
        this.program,
        "u_fogEnd"
      );


    this.fogColorLocation =
      gl.getUniformLocation(
        this.program,
        "u_fogColor"
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
  }


  // =========================================================
  // BUILD DUNGEON GEOMETRY
  // =========================================================

  buildDungeonGeometry() {
    const wallVertices = [];
    const floorVertices = [];
    const ceilingVertices = [];


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


        // -----------------------------------------------------
        // FLOOR
        // -----------------------------------------------------

        this.addFloor(
          floorVertices,
          row,
          col
        );


        // -----------------------------------------------------
        // CEILING
        // -----------------------------------------------------

        this.addCeiling(
          ceilingVertices,
          row,
          col
        );


        /*
         * NORTH and WEST walls are generated
         * for every room.
         *
         * SOUTH and EAST walls are only needed
         * on the dungeon outer boundary.
         */


        // -----------------------------------------------------
        // NORTH WALL
        // -----------------------------------------------------

        if (!room.northDoor) {

          this.addNorthWall(
            wallVertices,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // WEST WALL
        // -----------------------------------------------------

        if (!room.westDoor) {

          this.addWestWall(
            wallVertices,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // SOUTH OUTER WALL
        // -----------------------------------------------------

        if (
          row ===
          this.dungeon.rows - 1
          &&
          !room.southDoor
        ) {

          this.addSouthWall(
            wallVertices,
            row,
            col
          );
        }


        // -----------------------------------------------------
        // EAST OUTER WALL
        // -----------------------------------------------------

        if (
          col ===
          this.dungeon.cols - 1
          &&
          !room.eastDoor
        ) {

          this.addEastWall(
            wallVertices,
            row,
            col
          );
        }
      }
    }


    this.uploadStaticBuffer(
      this.wallBuffer,
      wallVertices
    );


    this.uploadStaticBuffer(
      this.floorBuffer,
      floorVertices
    );


    this.uploadStaticBuffer(
      this.ceilingBuffer,
      ceilingVertices
    );


    /*
     * Each vertex stores:
     *
     * x
     * y
     * z
     * u
     * v
     */

    this.wallVertexCount =
      wallVertices.length / 5;


    this.floorVertexCount =
      floorVertices.length / 5;


    this.ceilingVertexCount =
      ceilingVertices.length / 5;
  }


  uploadStaticBuffer(
    buffer,
    vertices
  ) {
    const gl = this.gl;


    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      buffer
    );


    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        vertices
      ),
      gl.STATIC_DRAW
    );
  }


  // =========================================================
  // FLOOR
  // =========================================================

  addFloor(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z1 = row;
    const z2 = row + 1;

    const y = 0;


    this.addQuad(
      vertices,

      [
        x1,
        y,
        z1
      ],

      [
        x2,
        y,
        z1
      ],

      [
        x2,
        y,
        z2
      ],

      [
        x1,
        y,
        z2
      ]
    );
  }


  // =========================================================
  // CEILING
  // =========================================================

  addCeiling(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z1 = row;
    const z2 = row + 1;

    const y = 1;


    this.addQuad(
      vertices,

      [
        x1,
        y,
        z2
      ],

      [
        x2,
        y,
        z2
      ],

      [
        x2,
        y,
        z1
      ],

      [
        x1,
        y,
        z1
      ]
    );
  }


  // =========================================================
  // NORTH WALL
  // =========================================================

  addNorthWall(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z = row;


    this.addQuad(
      vertices,

      [
        x1,
        0,
        z
      ],

      [
        x2,
        0,
        z
      ],

      [
        x2,
        1,
        z
      ],

      [
        x1,
        1,
        z
      ]
    );
  }


  // =========================================================
  // SOUTH WALL
  // =========================================================

  addSouthWall(
    vertices,
    row,
    col
  ) {

    const x1 = col;
    const x2 = col + 1;

    const z =
      row + 1;


    this.addQuad(
      vertices,

      [
        x2,
        0,
        z
      ],

      [
        x1,
        0,
        z
      ],

      [
        x1,
        1,
        z
      ],

      [
        x2,
        1,
        z
      ]
    );
  }


  // =========================================================
  // WEST WALL
  // =========================================================

  addWestWall(
    vertices,
    row,
    col
  ) {

    const x = col;

    const z1 = row;
    const z2 = row + 1;


    this.addQuad(
      vertices,

      [
        x,
        0,
        z2
      ],

      [
        x,
        0,
        z1
      ],

      [
        x,
        1,
        z1
      ],

      [
        x,
        1,
        z2
      ]
    );
  }


  // =========================================================
  // EAST WALL
  // =========================================================

  addEastWall(
    vertices,
    row,
    col
  ) {

    const x =
      col + 1;

    const z1 = row;
    const z2 = row + 1;


    this.addQuad(
      vertices,

      [
        x,
        0,
        z1
      ],

      [
        x,
        0,
        z2
      ],

      [
        x,
        1,
        z2
      ],

      [
        x,
        1,
        z1
      ]
    );
  }


  // =========================================================
  // GENERIC QUAD
  // =========================================================

  addQuad(
    vertices,
    bottomLeft,
    bottomRight,
    topRight,
    topLeft
  ) {

    /*
     * Rectangle becomes two triangles.
     *
     * Triangle 1:
     *
     * bottomLeft
     * bottomRight
     * topRight
     *
     * Triangle 2:
     *
     * bottomLeft
     * topRight
     * topLeft
     */


    // Triangle 1

    this.addVertex(
      vertices,
      bottomLeft,
      0,
      1
    );


    this.addVertex(
      vertices,
      bottomRight,
      1,
      1
    );


    this.addVertex(
      vertices,
      topRight,
      1,
      0
    );


    // Triangle 2

    this.addVertex(
      vertices,
      bottomLeft,
      0,
      1
    );


    this.addVertex(
      vertices,
      topRight,
      1,
      0
    );


    this.addVertex(
      vertices,
      topLeft,
      0,
      0
    );
  }


  addVertex(
    vertices,
    position,
    u,
    v
  ) {

    vertices.push(
      position[0],
      position[1],
      position[2],
      u,
      v
    );
  }

  addQuadWithUV(
    vertices,
    bottomLeft,
    bottomRight,
    topRight,
    topLeft,
    uMin,
    uMax
  ) {

    // Triangle 1
    this.addVertex(
      vertices,
      bottomLeft,
      uMin,
      1
    );

    this.addVertex(
      vertices,
      bottomRight,
      uMax,
      1
    );

    this.addVertex(
      vertices,
      topRight,
      uMax,
      0
    );


    // Triangle 2
    this.addVertex(
      vertices,
      bottomLeft,
      uMin,
      1
    );

    this.addVertex(
      vertices,
      topRight,
      uMax,
      0
    );

    this.addVertex(
      vertices,
      topLeft,
      uMin,
      0
    );
  }

  drawAnimatedBillboardSprite(
    row,
    col,
    texture,
    width,
    height,
    frameIndex,
    frameCount
  ) {

    if (!texture) {
      return;
    }


    const centerX =
      col + 0.5;

    const centerZ =
      row + 0.5;


    const forward =
      this.getForwardVector();


    const rightX =
      -forward.z;

    const rightZ =
      forward.x;


    const halfWidth =
      width / 2;


    const leftX =
      centerX
      -
      rightX * halfWidth;

    const leftZ =
      centerZ
      -
      rightZ * halfWidth;


    const rightXPosition =
      centerX
      +
      rightX * halfWidth;

    const rightZPosition =
      centerZ
      +
      rightZ * halfWidth;


    const bottom = 0;
    const top =
      bottom + height;


    /*
     * HIVA.png:
     *
     * frame 0 = left half
     * frame 1 = right half
     */

    const frameWidth =
      1 / frameCount;

    const uMin =
      frameIndex * frameWidth;

    const uMax =
      uMin + frameWidth;


    const vertices = [];


    this.addQuadWithUV(
      vertices,

      [
        leftX,
        bottom,
        leftZ
      ],

      [
        rightXPosition,
        bottom,
        rightZPosition
      ],

      [
        rightXPosition,
        top,
        rightZPosition
      ],

      [
        leftX,
        top,
        leftZ
      ],

      uMin,
      uMax
    );


    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }


  // =========================================================
  // TEXTURES
  // =========================================================

  loadTextures() {

    /*
     * Dungeon surface textures use flipY = true.
     *
     * Sprites use flipY = false.
     */


    this.wallTexture =
      this.loadTexture(
        this.texturePaths.wall,
        true
      );


    this.floorTexture =
      this.loadTexture(
        this.texturePaths.floor,
        true
      );


    this.ceilingTexture =
      this.loadTexture(
        this.texturePaths.ceiling,
        true
      );


    this.wizardTexture =
      this.loadTexture(
        this.texturePaths.wizard,
        false
      );


    this.flowerTexture =
      this.loadTexture(
        this.texturePaths.flower,
        false
      )

    this.greenPotionTexture =
      this.loadTexture(
        this.texturePaths.green_potion,
        false
      )

    this.cookiesTexture =
      this.loadTexture(
        this.texturePaths.cookies,
        false
      )

    this.potionTexture =
      this.loadTexture(
        this.texturePaths.potion,
        false
      );


    this.trapTexture =
      this.loadTexture(
        this.texturePaths.trap,
        false
      );

    this.exitTexture =
      this.loadTexture(
        this.texturePaths.exit,
        false
      );
  }


  loadTexture(
    path,
    flipY = false
  ) {

    const gl = this.gl;


    const texture =
      gl.createTexture();


    gl.bindTexture(
      gl.TEXTURE_2D,
      texture
    );


    /*
     * Temporary pixel while the image loads.
     */

    const placeholder =
      new Uint8Array([
        70,
        80,
        65,
        255
      ]);


    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      placeholder
    );


    const image =
      new Image();


    image.onload = () => {

      gl.bindTexture(
        gl.TEXTURE_2D,
        texture
      );


      /*
       * Important:
       *
       * WebGL remembers this setting globally.
       * Set it explicitly for every texture.
       */

      gl.pixelStorei(
        gl.UNPACK_FLIP_Y_WEBGL,
        flipY
      );


      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );


      /*
       * Pixel-art rendering.
       */

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.NEAREST
      );


      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.NEAREST
      );


      /*
       * Works with arbitrary PNG dimensions.
       */

      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
      );


      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
      );


      this.render();
    };


    image.src = path;


    return texture;
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
      this.program
    );


    const aspect =
      this.canvas.width
      /
      this.canvas.height;


    const projection =
      this.createPerspectiveMatrix(
        this.degreesToRadians(
          70
        ),
        aspect,
        0.05,
        30
      );


    const view =
      this.createViewMatrix();


    gl.uniformMatrix4fv(
      this.projectionLocation,
      false,
      projection
    );


    gl.uniformMatrix4fv(
      this.viewLocation,
      false,
      view
    );


    gl.uniform1i(
      this.samplerLocation,
      0
    );

    gl.uniform1f(
      this.fogStartLocation,
      1.0
    );


    gl.uniform1f(
      this.fogEndLocation,
      5.5
    );


    gl.uniform3f(
      this.fogColorLocation,
      0.03,
      0.04,
      0.03
    );


    // ---------------------------------------------------------
    // FLOOR
    // ---------------------------------------------------------

    this.drawBuffer(
      this.floorBuffer,
      this.floorVertexCount,
      this.floorTexture
    );


    // ---------------------------------------------------------
    // CEILING
    // ---------------------------------------------------------

    this.drawBuffer(
      this.ceilingBuffer,
      this.ceilingVertexCount,
      this.ceilingTexture
    );


    // ---------------------------------------------------------
    // WALLS
    // ---------------------------------------------------------

    this.drawBuffer(
      this.wallBuffer,
      this.wallVertexCount,
      this.wallTexture
    );


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
        return this.flowerTexture;

      case "POTION_GREEN":
        return this.greenPotionTexture;

      case "COOKIES":
        return this.cookiesTexture;

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


        // Artifacts
        if (
          room.hasArtifact()
        ) {

          const texture =
            this.getArtifactTexture(
              room.artifact
            );


          this.drawFloatingBillboardSprite(
            row,
            col,
            texture,
            0.40,
            0.40
          );
        }

        // Potion
        if (room.hasPotion) {

          this.drawFloatingBillboardSprite(
            row,
            col,
            this.potionTexture,
            0.30,
            0.35
          );
        }


        // Trap
        if (
          room.hasTrap
          &&
          !room.trapTriggered
        ) {

          this.drawFloorSprite(
            row,
            col,
            this.trapTexture,
            0.65
          );
        }
      }
    }
  }


  // =========================================================
  // GENERIC BILLBOARD SPRITE
  // =========================================================

  drawBillboardSprite(
    row,
    col,
    texture,
    width,
    height
  ) {

    if (!texture) {
      return;
    }


    const gl = this.gl;


    const centerX =
      col + 0.5;


    const centerZ =
      row + 0.5;


    /*
     * Player camera direction.
     */

    const forward =
      this.getForwardVector();


    /*
     * Perpendicular vector gives us
     * the horizontal billboard axis.
     */

    const rightX =
      -forward.z;


    const rightZ =
      forward.x;


    const halfWidth =
      width / 2;


    const leftX =
      centerX
      -
      rightX * halfWidth;


    const leftZ =
      centerZ
      -
      rightZ * halfWidth;


    const rightXPosition =
      centerX
      +
      rightX * halfWidth;


    const rightZPosition =
      centerZ
      +
      rightZ * halfWidth;

    const bottom = 0;


    const top =
      bottom + height;


    const vertices = [];


    this.addQuad(
      vertices,

      [
        leftX,
        bottom,
        leftZ
      ],

      [
        rightXPosition,
        bottom,
        rightZPosition
      ],

      [
        rightXPosition,
        top,
        rightZPosition
      ],

      [
        leftX,
        top,
        leftZ
      ]
    );


    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }

  drawFloatingBillboardSprite(
    row,
    col,
    texture,
    width,
    height
  ) {

    if (!texture) {
      return;
    }


    const centerX =
      col + 0.5;

    const centerZ =
      row + 0.5;


    const forward =
      this.getForwardVector();


    const rightX =
      -forward.z;

    const rightZ =
      forward.x;


    const halfWidth =
      width / 2;


    const leftX =
      centerX
      -
      rightX * halfWidth;

    const leftZ =
      centerZ
      -
      rightZ * halfWidth;


    const rightXPosition =
      centerX
      +
      rightX * halfWidth;

    const rightZPosition =
      centerZ
      +
      rightZ * halfWidth;


    // Small vertical bob
    const bob =
      Math.sin(
        this.animationTime * 0.003
      )
      *
      0.04;


    // Middle of the room
    const centerY =
      0.5 + bob;


    const bottom =
      centerY
      -
      height / 2;

    const top =
      centerY
      +
      height / 2;


    const vertices = [];


    this.addQuad(
      vertices,

      [
        leftX,
        bottom,
        leftZ
      ],

      [
        rightXPosition,
        bottom,
        rightZPosition
      ],

      [
        rightXPosition,
        top,
        rightZPosition
      ],

      [
        leftX,
        top,
        leftZ
      ]
    );


    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }


  // =========================================================
  // FLOOR SPRITE
  // =========================================================

  drawFloorSprite(
    row,
    col,
    texture,
    size
  ) {

    if (!texture) {
      return;
    }


    const centerX =
      col + 0.5;


    const centerZ =
      row + 0.5;


    const half =
      size / 2;


    /*
     * Slight offset prevents z-fighting
     * with the actual floor.
     */

    const y =
      0.005;


    const vertices = [];


    this.addQuad(
      vertices,

      [
        centerX - half,
        y,
        centerZ - half
      ],

      [
        centerX + half,
        y,
        centerZ - half
      ],

      [
        centerX + half,
        y,
        centerZ + half
      ],

      [
        centerX - half,
        y,
        centerZ + half
      ]
    );


    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }

  drawExitSprite() {

    const row =
      this.dungeon.exitPosition.row;

    const col =
      this.dungeon.exitPosition.col;


    this.drawAnimatedBillboardSprite(
      row,
      col,
      this.exitTexture,
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

      this.updateCamera(
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
  // DYNAMIC SPRITE DRAW
  // =========================================================

  uploadDynamicSprite(
    vertices,
    texture
  ) {

    const gl =
      this.gl;


    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.spriteBuffer
    );


    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        vertices
      ),
      gl.DYNAMIC_DRAW
    );


    gl.enable(
      gl.BLEND
    );


    gl.blendFunc(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA
    );


    // Sprites participate in depth normally.
    gl.depthMask(
      true
    );


    this.drawBuffer(
      this.spriteBuffer,
      6,
      texture
    );


    gl.disable(
      gl.BLEND
    );
  }


  // =========================================================
  // WIZARD
  // =========================================================

  drawWizard() {

    this.drawBillboardSprite(
      this.wizard.row,
      this.wizard.col,
      this.wizardTexture,
      0.55,
      0.85
    );
  }


  // =========================================================
  // DRAW BUFFER
  // =========================================================

  drawBuffer(
    buffer,
    vertexCount,
    texture
  ) {

    const gl = this.gl;


    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      buffer
    );


    /*
     * Vertex layout:
     *
     * x y z u v
     *
     * 5 floats total.
     */

    const stride =
      5
      *
      Float32Array.BYTES_PER_ELEMENT;


    // ---------------------------------------------------------
    // POSITION
    // ---------------------------------------------------------

    gl.enableVertexAttribArray(
      this.positionLocation
    );


    gl.vertexAttribPointer(
      this.positionLocation,
      3,
      gl.FLOAT,
      false,
      stride,
      0
    );


    // ---------------------------------------------------------
    // TEXTURE COORDINATES
    // ---------------------------------------------------------

    gl.enableVertexAttribArray(
      this.textureLocation
    );


    gl.vertexAttribPointer(
      this.textureLocation,
      2,
      gl.FLOAT,
      false,
      stride,
      3
      *
      Float32Array.BYTES_PER_ELEMENT
    );


    // ---------------------------------------------------------
    // TEXTURE
    // ---------------------------------------------------------

    gl.activeTexture(
      gl.TEXTURE0
    );


    gl.bindTexture(
      gl.TEXTURE_2D,
      texture
    );


    // ---------------------------------------------------------
    // DRAW
    // ---------------------------------------------------------

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      vertexCount
    );
  }


  // =========================================================
  // CAMERA
  // =========================================================

  createViewMatrix() {

    const eye = [

      this.cameraX,

      0.5,

      this.cameraZ
    ];


    const forwardX =
      Math.sin(
        this.cameraAngle
      );

    const forwardZ =
      -Math.cos(
        this.cameraAngle
      );


    const target = [

      eye[0] + forwardX,

      eye[1],

      eye[2] + forwardZ
    ];


    const up = [
      0,
      1,
      0
    ];


    return this.createLookAtMatrix(
      eye,
      target,
      up
    );
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


  getForwardVector() {

    switch (
      this.player.direction
      ) {

      case "NORTH":

        return {
          x: 0,
          z: -1
        };


      case "EAST":

        return {
          x: 1,
          z: 0
        };


      case "SOUTH":

        return {
          x: 0,
          z: 1
        };


      case "WEST":

        return {
          x: -1,
          z: 0
        };


      default:

        return {
          x: 0,
          z: -1
        };
    }
  }

  updateCamera(
    deltaTime
  ) {

    this.targetCameraX =
      this.player.col + 0.5;

    this.targetCameraZ =
      this.player.row + 0.5;

    this.targetCameraAngle =
      this.directionToAngle(
        this.player.direction
      );


    const moveAmount =
      Math.min(
        1,
        deltaTime
        * this.cameraMoveSpeed
      );


    this.cameraX +=
      (
        this.targetCameraX
        - this.cameraX
      )
      * moveAmount;


    this.cameraZ +=
      (
        this.targetCameraZ
        - this.cameraZ
      )
      * moveAmount;


    // Find shortest rotational distance.
    let angleDifference =
      this.targetCameraAngle
      - this.cameraAngle;


    angleDifference =
      Math.atan2(
        Math.sin(angleDifference),
        Math.cos(angleDifference)
      );


    const turnAmount =
      Math.min(
        1,
        deltaTime
        * this.cameraTurnSpeed
      );


    this.cameraAngle +=
      angleDifference
      * turnAmount;
  }


  // =========================================================
  // PERSPECTIVE MATRIX
  // =========================================================

  createPerspectiveMatrix(
    fieldOfView,
    aspect,
    near,
    far
  ) {

    const f =
      1.0
      /
      Math.tan(
        fieldOfView / 2
      );


    const rangeInverse =
      1
      /
      (
        near - far
      );


    return new Float32Array([

      f / aspect,
      0,
      0,
      0,


      0,
      f,
      0,
      0,


      0,
      0,
      (
        near + far
      )
      *
      rangeInverse,
      -1,


      0,
      0,
      (
        2
        *
        near
        *
        far
      )
      *
      rangeInverse,
      0
    ]);
  }


  // =========================================================
  // LOOK-AT MATRIX
  // =========================================================

  createLookAtMatrix(
    eye,
    target,
    up
  ) {

    /*
     * Camera backwards axis.
     */

    const zAxis =
      this.normalize([

        eye[0]
        -
        target[0],

        eye[1]
        -
        target[1],

        eye[2]
        -
        target[2]
      ]);


    /*
     * Camera right axis.
     */

    const xAxis =
      this.normalize(
        this.cross(
          up,
          zAxis
        )
      );


    /*
     * Camera up axis.
     */

    const yAxis =
      this.cross(
        zAxis,
        xAxis
      );


    return new Float32Array([

      xAxis[0],
      yAxis[0],
      zAxis[0],
      0,


      xAxis[1],
      yAxis[1],
      zAxis[1],
      0,


      xAxis[2],
      yAxis[2],
      zAxis[2],
      0,


      -this.dot(
        xAxis,
        eye
      ),

      -this.dot(
        yAxis,
        eye
      ),

      -this.dot(
        zAxis,
        eye
      ),

      1
    ]);
  }


  // =========================================================
  // VECTOR HELPERS
  // =========================================================

  normalize(vector) {

    const length =
      Math.sqrt(

        vector[0]
        *
        vector[0]

        +

        vector[1]
        *
        vector[1]

        +

        vector[2]
        *
        vector[2]
      );


    if (length === 0) {

      return [
        0,
        0,
        0
      ];
    }


    return [

      vector[0]
      /
      length,

      vector[1]
      /
      length,

      vector[2]
      /
      length
    ];
  }


  cross(a, b) {

    return [

      a[1] * b[2]
      -
      a[2] * b[1],


      a[2] * b[0]
      -
      a[0] * b[2],


      a[0] * b[1]
      -
      a[1] * b[0]
    ];
  }


  dot(a, b) {

    return (

      a[0] * b[0]

      +

      a[1] * b[1]

      +

      a[2] * b[2]
    );
  }


  degreesToRadians(
    degrees
  ) {

    return (

      degrees
      *
      Math.PI
      /
      180
    );
  }

  resizeCanvas() {

    const pixelRatio =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );


    const displayWidth =
      Math.floor(
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
