import { Vector, Point } from "./vector";

type Types = Vector | Point;

export function type(a1: Types, a2: Types): String {
  return a1 instanceof Vector && a2 instanceof Vector ? "Vector" : "Point";
}

export function add(
  args: Types[],
  index: number,
  prev?: Vector | Point
): Vector | Point {
  let newPrev: Types;
  const cur = args[index];
  if (prev) {
    if (type(prev, cur) === "Vector") {
      newPrev = new Vector(prev.x + cur.x, prev.y + cur.y);
    } else {
      const z = prev.z + cur.z;
      newPrev = new Point((prev.x + cur.x) / z, (prev.y + cur.y) / z, 1);
    }
    if (args[index + 1]) {
      return add(args, index + 1, newPrev);
    }
    return newPrev;
  }
  return add(args, index + 1, cur);
}

export function subtract(
  args: Types[],
  index: number,
  prev?: Vector | Point
): Vector | Point {
  let newPrev: Types;
  const cur = args[index];
  if (prev) {
    if (type(prev, cur) === "Vector") {
      newPrev = new Vector(prev.x - cur.x, prev.y - cur.y);
    } else {
      const z = cur.z - prev.z;
      newPrev =
        z === 0
          ? new Vector(cur.x - prev.x, cur.y - prev.y)
          : new Point((cur.x - prev.x) / z, (cur.y - prev.y) / z, 1);
    }
    if (args[index + 1]) {
      return subtract(args, index + 1, newPrev);
    }
    return newPrev;
  }
  return subtract(args, index + 1, cur);
}

export function dot() {}

export function cross() {}

export const toDegrees = (radians: number) => (radians * 180) / Math.PI;
export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
