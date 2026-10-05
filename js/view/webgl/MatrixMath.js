export class MatrixMath {

  static createPerspective(
    fieldOfView, aspect, near, far) {
    const f =
      1.0 / Math.tan(fieldOfView / 2);

    const rangeInverse =
      1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0, 0, 0,
      (near + far) * rangeInverse, -1, 0, 0,
      (2 * near * far) * rangeInverse, 0]);
  }


  static createLookAt(eye, target, up) {

    const zAxis =
      this.normalize([
        eye[0] - target[0],
        eye[1] - target[1],
        eye[2] - target[2]]);

    const xAxis =
      this.normalize(this.cross(up, zAxis));

    const yAxis =
      this.cross(zAxis, xAxis);

    return new Float32Array([
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -this.dot(xAxis, eye),
      -this.dot(yAxis, eye),
      -this.dot(zAxis, eye), 1]);
  }


  static normalize(vector) {
    const length =
      Math.sqrt(
        vector[0]
        * vector[0] + vector[1]
        * vector[1] + vector[2] * vector[2]
      );

    if (length === 0) {
      return [0, 0, 0];
    }

    return [
      vector[0] / length,
      vector[1] / length,
      vector[2] / length];
  }


  static cross(a, b) {

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


  static dot(a, b) {
    return (
      a[0] * b[0]
      +
      a[1] * b[1]
      +
      a[2] * b[2]
    );
  }

  static degreesToRadians(degrees) {
    return (degrees * Math.PI / 180);
  }
}
