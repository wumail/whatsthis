import { Point } from "./vector";

export class Shape {
  constructor() {}
  static ellipse(longAxis: number, shortAxis: number) {}
  static circle(radius: number) {}
  static rectangle(width: number, height: number) {}
  static polygon(coords: Point[]) {}
  static polyline(coords: Point[]) {}
  static bezier(p1: Point, p2: Point, cp1: Point, cp2: Point) {}
}
