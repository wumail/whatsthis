import { normal } from "../../constant";
import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Edge } from "../Base/edge";
import { genTriangleMarker } from "./marker";
import { ManhattanLayout } from "../../algorithm/ManhattanLayout";

// export class Polyline extends Edge {
//   type: string = "polyline";

//   constructor(anchors: number[][] | Point[]) {
//     super();
//     this.genShape(
//       anchors.map((anchor: any) => {
//         return anchor.coord;
//       })
//     );
//   }

//   genShape(coordinates: Point[]): Matrix {
//     const tmp = new Matrix(...(coordinates as number[][] | Point[]));
//     if (this.origin === undefined) {
//       this.origin = tmp;
//     }
//     this.coords = tmp;
//     this.genPath();
//     return this.coords;
//   }

//   genPath(): string {
//     let { coords } = this;
//     (coords as any) = coords.to2D();
//     const path = `M ${coords[0].join(" ")} ${coords
//       .slice(1)
//       .map((coord: any) => {
//         return `L ${coord.join(" ")}`;
//       })
//       .join(" ")}`;
//     // this.triangulation = triangulationFn(commandExplain(path));
//     return (this.path = path);
//   }
// }

export class Polyline extends Edge {
  type: string = "polyline";
  startBBox: any;
  endBBox: any;
  constructor(start: any, end: any) {
    super();
    this.startNode = start.nodeId;
    this.endNode = end.nodeId;
    const s = window.nodes.get(start.nodeId);
    const e = window.nodes.get(end.nodeId);
    this.startAnchor = s?.anchors?.[start.anchorId];
    this.startBBox = s;
    this.endAnchor = e?.anchors?.[end.anchorId];
    this.endBBox = e;
    console.log(this.startBBox, this.endBBox);
  }

  genShape(coordinates: number | number[][] | Point[]): Matrix {
    const tmp = new Matrix(...(coordinates as number[][] | Point[]));
    if (this.origin === undefined) {
      this.origin = tmp;
    }
    this.coords = tmp;
    this.genPath();
    return this.coords;
  }

  genPath(): string {
    const { startAnchor, endAnchor } = this;
    const s = startAnchor.coord;
    const e = endAnchor.coord;
    const coords: any[] = ManhattanLayout(
      s,
      e,
      this.startBBox,
      this.endBBox,
      10
    );
    // const path = `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    const path = `M ${coords[0].x} ${coords[0].y} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.x} ${coord.y}`;
      })
      .join(" ")}`;
    const v = e.subtract(s);
    const dir = normal.angle(v);
    // this.marker = genTriangleMarker(dir, e);
    this.marker = null;
    // this.triangulation = triangulationFn(commandExplain(path));
    return (this.path = path);
  }
}
