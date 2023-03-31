import { K } from "../../constant";
import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Node } from "../Base/node";

export class Ellipse extends Node {
  longAxis: number;
  shortAxis: number;
  type: string = "ellipse";
  constructor(longAxis: number, shortAxis: number) {
    super();
    this.longAxis = longAxis;
    this.shortAxis = shortAxis;
    this.genShape(longAxis, shortAxis);
  }

  genShape(
    longAxis: number | number[][] | Point[],
    shortAxis?: number
  ): Matrix {
    const lA = (longAxis as number) / 2,
      sA = (shortAxis as number) / 2;
    // 切线的dx dy
    const cpX = (lA as number) * K,
      cpY = (sA as number) * K;

    const part1 = [
      new Point(-lA, 0),
      new Point(-lA, cpY),
      new Point(-cpX, sA),
      new Point(0, sA),
    ];
    const part2 = [new Point(cpX, sA), new Point(lA, cpY), new Point(lA, 0)];
    const part3 = [new Point(lA, -cpY), new Point(cpX, -sA), new Point(0, -sA)];
    const part4 = [
      new Point(-cpX, -sA),
      new Point(-lA, -cpY),
      new Point(-lA, 0),
    ];
    const tmp = new Matrix(...part1.concat(part2, part3, part4));
    if (this.origin === undefined) {
      this.origin = tmp;
    }
    return (this.coords = tmp);
  }

  genPath(): string {
    let { coords } = this;
    coords = coords.to2D();
    const M = coords[0];
    const C = coords.slice(1);
    const path = `M${M.join(" ")}${(C as any).reduce(
      (prev: string, cur: any[], index: number) => {
        if (index % 3 === 0) {
          return prev + `C${cur.join(" ")} `;
        } else if (index % 3 === 1) {
          return prev + `${cur.join(" ")} `;
        } else {
          return prev + `${cur.join(" ")}`;
        }
      },
      ""
    )}z`;
    // this.triangulation = triangulationFn(commandExplain(path));
    // this.bbox.matrix.forEach((o) => new Rectangle(4, 4).translate(o.x, o.y));
    // for (let i = 0; i < this.triangulation.length; i++) {
    //   const [p1, p2, p3] = this.triangulation[i];
    //   // new Rectangle(2, 2).translate(p1.x, p1.y);
    //   // new Rectangle(2, 2).translate(p2.x, p2.y);
    //   // new Rectangle(2, 2).translate(p3.x, p3.y);
    //   new Polyline([p1, p2]);
    //   new Polyline([p1, p3]);
    //   new Polyline([p2, p3]);
    // }
    return (this.path = path);
  }
}
