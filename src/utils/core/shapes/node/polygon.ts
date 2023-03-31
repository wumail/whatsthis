import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Node } from "../Base/node";

export class Polygon extends Node {
  type: string = "polygon";

  constructor(coordinates: number[][] | Point[]) {
    super();
    coordinates && this.genShape(coordinates);
  }

  genShape(coordinates: number | number[][] | Point[]): Matrix {
    const tmp = new Matrix(...(coordinates as number[][] | Point[]));
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
