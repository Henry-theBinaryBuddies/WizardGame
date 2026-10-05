import {
  GeometryBuilder
} from "./GeometryBuilder.js";


export class SpriteRenderer {

  constructor(
    gl,
    spriteBuffer,
    drawBuffer,
    getForwardVector
  ) {

    this.gl = gl;

    this.spriteBuffer =
      spriteBuffer;

    this.drawBuffer =
      drawBuffer;

    this.getForwardVector =
      getForwardVector;
  }

  getBillboardBounds(
    row,
    col,
    width
  ) {

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


    return {

      leftX:
        centerX
        -
        rightX * halfWidth,

      leftZ:
        centerZ
        -
        rightZ * halfWidth,

      rightX:
        centerX
        +
        rightX * halfWidth,

      rightZ:
        centerZ
        +
        rightZ * halfWidth
    };
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

    const bounds =
      this.getBillboardBounds(
        row,
        col,
        width
      );

    const bottom = 0;

    const top =
      bottom + height;


    const frameWidth =
      1 / frameCount;

    const uMin =
      frameIndex * frameWidth;

    const uMax =
      uMin + frameWidth;


    const vertices = [];


    GeometryBuilder.addQuadWithUV(
      vertices,

      [
        bounds.leftX,
        bottom,
        bounds.leftZ
      ],

      [
        bounds.rightX,
        bottom,
        bounds.rightZ
      ],

      [
        bounds.rightX,
        top,
        bounds.rightZ
      ],

      [
        bounds.leftX,
        top,
        bounds.leftZ
      ],

      uMin,
      uMax
    );


    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }


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

    const bounds =
      this.getBillboardBounds(
        row,
        col,
        width
      );


    const bottom = 0;

    const top =
      bottom + height;


    const vertices = [];


    GeometryBuilder.addQuad(
      vertices,

      [
        bounds.leftX,
        bottom,
        bounds.leftZ
      ],

      [
        bounds.rightX,
        bottom,
        bounds.rightZ
      ],

      [
        bounds.rightX,
        top,
        bounds.rightZ
      ],

      [
        bounds.leftX,
        top,
        bounds.leftZ
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
    height,
    animationTime
  ) {

    if (!texture) {
      return;
    }

    const bounds =
      this.getBillboardBounds(
        row,
        col,
        width
      );


    const bob =
      Math.sin(
        animationTime * 0.003
      )
      *
      0.04;


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


    GeometryBuilder.addQuad(
      vertices,
      [
        bounds.leftX,
        bottom,
        bounds.leftZ
      ],

      [
        bounds.rightX,
        bottom,
        bounds.rightZ
      ],

      [
        bounds.rightX,
        top,
        bounds.rightZ
      ],

      [
        bounds.leftX,
        top,
        bounds.leftZ
      ]
    );

    this.uploadDynamicSprite(
      vertices,
      texture
    );
  }


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


    const y =
      0.005;


    const vertices = [];


    GeometryBuilder.addQuad(
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


    gl.depthMask(
      true
    );


    const vertexCount =
      vertices.length / 5;


    this.drawBuffer(
      this.spriteBuffer,
      vertexCount,
      texture
    );


    gl.disable(
      gl.BLEND
    );
  }

}
