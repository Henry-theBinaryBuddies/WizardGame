export class GeometryBuilder {

  static addVertex(
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


  static addQuad(
    vertices,
    bottomLeft,
    bottomRight,
    topRight,
    topLeft
  ) {

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


  static addQuadWithUV(
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
}
