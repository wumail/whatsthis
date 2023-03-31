import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Edge } from "../Base/edge";

export class Polyline extends Edge {
  type: string = "polyline";

  constructor(anchors: number[][] | Point[]) {
    super();
    this.genShape(
      anchors.map((anchor: any) => {
        return anchor.coord;
      })
    );
  }

  genShape(coordinates: Point[]): Matrix {
    const tmp = new Matrix(...(coordinates as number[][] | Point[]));
    if (this.origin === undefined) {
      this.origin = tmp;
    }
    this.coords = tmp;
    this.genPath();
    return this.coords;
  }

  genPath(): string {
    let { coords } = this;
    (coords as any) = coords.to2D();
    const path = `M ${coords[0].join(" ")} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.join(" ")}`;
      })
      .join(" ")}`;
    // this.triangulation = triangulationFn(commandExplain(path));
    return (this.path = path);
  }
}
