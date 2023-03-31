import { normal } from "../../constant";
import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Edge } from "../Base/edge";
import { genTriangleMarker } from "./marker";

export class StraightLine extends Edge {
  type: string = "straight";
  constructor(start: any, end: any) {
    super();
    this.startNode = start.nodeId;
    this.endNode = end.nodeId;
    this.startAnchor = window.nodes.get(start.nodeId)?.anchors?.[
      start.anchorId
    ];
    this.endAnchor = window.nodes.get(end.nodeId)?.anchors?.[end.anchorId];
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
    const path = `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    const v = e.subtract(s);
    const dir = normal.angle(v);
    this.marker = genTriangleMarker(dir, e);
    // this.triangulation = triangulationFn(commandExplain(path));
    return (this.path = path);
  }
}
