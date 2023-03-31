import { toDegrees, type } from "./geometry";

class Base extends Array {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    super(3);
    this[0] = x;
    this[1] = y;
    this[2] = z;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(v1: Vector | Point): Vector | Point {
    if (type(this, v1) === "Vector") {
      return new Vector(this.x + v1.x, this.y + v1.y);
    } else {
      const z = this.z + v1.z;
      return new Point((this.x + v1.x) / z, (this.y + v1.y) / z, 1);
    }
  }
  subtract(v1: Vector | Point): Vector | Point {
    if (type(this, v1) === "Vector") {
      return new Vector(this.x - v1.x, this.y - v1.y);
    }
    const z = this.z - v1.z;
    return z === 0
      ? new Vector(this.x - v1.x, this.y - v1.y)
      : new Point((this.x - v1.x) / z, (this.y - v1.y) / z, 1);
  }
}

class Vector extends Base {
  constructor(x: number, y: number, z?: number) {
    super(x, y, z ?? 0);
  }
  toString(): string {
    return "Vector";
  }
  dot(v1: Vector) {
    return v1.reduce((prev, cur, index) => prev + cur * this[index]);
  }
  cross(v1: Vector) {
    return new Vector(
      this.y * v1.z - this.z * v1.y,
      this.z * v1.x - this.x * v1.z,
      this.x * v1.y - this.y * v1.x
    );
  }
  getLength() {
    return Math.hypot(this.x, this.y);
  }
  normalize() {
    const len = this.getLength();
    return new Vector(this.x / len, this.y / len);
  }
  crossZ(v1: Vector) {
    return this.x * v1.y - this.y * v1.x;
  }
  angle(v1: Vector) {
    const negative = this.crossZ(v1);
    const r = Math.acos(this.normalize().dot(v1.normalize()));
    return negative >= 0 ? r : -r;
  }
}

class Point extends Base {
  constructor(x: number, y: number, z?: number) {
    super(x, y, 1);
  }

  toString(): string {
    return "Point";
  }
}

export { Vector, Point };
