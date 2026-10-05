export class TextureManager {

  constructor(gl) {

    this.gl = gl;
    // =========================================================
    // TEXTURE PATHS
    // =========================================================
    this.texturePaths = {
      wall: "assets/images/wall_texture.webp",
      floor: "assets/images/floor_texture.webp",
      ceiling: "assets/images/ceiling_texture.webp",
      wizard: "assets/images/wizard.webp",

      cookies: "assets/images/cookies.webp",
      flower: "assets/images/flower.webp",
      green_potion: "assets/images/green_potion.webp",

      potion: "assets/images/potion.webp",
      trap: "assets/images/trap.webp",
      exit: "assets/images/HIVA.webp",

      POSTER_1: "assets/images/posters/poster1.webp",
      POSTER_2: "assets/images/posters/poster2.webp",
      POSTER_3: "assets/images/posters/poster3.webp",
      POSTER_4: "assets/images/posters/poster4.webp",
      POSTER_5: "assets/images/posters/poster5.webp",
      POSTER_6: "assets/images/posters/poster6.webp",
      POSTER_7: "assets/images/posters/poster7.webp",

      GRAFFITI_1: "assets/images/graffiti/graffiti1.webp",
      GRAFFITI_2: "assets/images/graffiti/graffiti2.webp",
      GRAFFITI_3: "assets/images/graffiti/graffiti3.webp",
      GRAFFITI_4: "assets/images/graffiti/graffiti4.webp",
      GRAFFITI_5: "assets/images/graffiti/graffiti5.webp",
      GRAFFITI_6: "assets/images/graffiti/graffiti6.webp"
    };

    this.textures = {};
  }

  loadAll() {
    /* Dungeon surfaces. */
    this.textures.wall =
      this.loadTexture(
        this.texturePaths.wall,
        true
      );

    this.textures.floor =
      this.loadTexture(
        this.texturePaths.floor,
        true
      );

    this.textures.ceiling =
      this.loadTexture(
        this.texturePaths.ceiling,
        true
      );

    /* Sprites. */
    this.textures.wizard =
      this.loadTexture(
        this.texturePaths.wizard,
        false
      );

    this.textures.flower =
      this.loadTexture(
        this.texturePaths.flower,
        false
      );

    this.textures.green_potion =
      this.loadTexture(
        this.texturePaths.green_potion,
        false
      );

    this.textures.cookies =
      this.loadTexture(
        this.texturePaths.cookies,
        false
      );

    this.textures.potion =
      this.loadTexture(
        this.texturePaths.potion,
        false
      );

    this.textures.trap =
      this.loadTexture(
        this.texturePaths.trap,
        false
      );

    this.textures.exit =
      this.loadTexture(
        this.texturePaths.exit,
        false
      );

    /* Posters. */
    for (
      let i = 1;
      i <= 7;
      i++
    ) {

      const key =
        "POSTER_" + i;

      this.textures[key] =
        this.loadTexture(
          this.texturePaths[key],
          false
        );
    }

    /* Graffiti. */
    for (
      let i = 1;
      i <= 6;
      i++
    ) {

      const key =
        "GRAFFITI_" + i;

      this.textures[key] =
        this.loadTexture(
          this.texturePaths[key],
          false
        );
    }
  }


  get(name) {
    return this.textures[name]
      ?? null;
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
    };

    image.src = path;

    return texture;
  }
}
