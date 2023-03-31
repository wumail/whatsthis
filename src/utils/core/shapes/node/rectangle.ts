import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Node } from "../Base/node";

export class Rectangle extends Node {
  width: number;
  height: number;
  type: string = "rectangle";

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
    this.genShape(width, height);
  }

  genShape(width: number | number[][] | Point[], height?: number): Matrix {
    const halfWidth = (width as number) / 2,
      halfHeight = (height as number) / 2;

    const coords = [
      new Point(-halfWidth, halfHeight),
      new Point(-halfWidth, -halfHeight),
      new Point(halfWidth, -halfHeight),
      new Point(halfWidth, halfHeight),
    ];
    const tmp = new Matrix(...coords);
    if (this.origin === undefined) {
      this.origin = tmp;
    }
    return (this.coords = tmp);
  }

  genPath(): string {
    let { coords } = this;
    coords = coords.to2D();
    const path = `M ${coords[0].join(" ")} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.join(" ")}`;
      })
      .join(" ")} z`;
    // this.triangulation = triangulationFn(commandExplain(path));
    return (this.path = path);
  }
}
