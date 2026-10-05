export class WebGLProgram {

  constructor(gl) {
    this.gl = gl;

    this.program = null;

    this.positionLocation = null;
    this.textureLocation = null;

    this.projectionLocation = null;
    this.viewLocation = null;
    this.samplerLocation = null;

    this.fogStartLocation = null;
    this.fogEndLocation = null;
    this.fogColorLocation = null;
  }


  initialize() {

    this.program =
      this.createShaderProgram();

    this.getShaderLocations();
  }


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


  compileShader(
    type,
    source
  ) {

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
     * x y z u v
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
      3 * Float32Array.BYTES_PER_ELEMENT
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
}
