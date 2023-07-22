import { normal } from "../../constant";
import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import { Edge } from "../Base/edge";
import { genTriangleMarker } from "./marker";
import { ManhattanLayout } from "../../algorithm/ManhattanLayout";

export class StraightLine extends Edge {
  type: string = "straight";
  startBBox: any;
  endBBox: any;
  constructor(start: any, end: any) {
    super();
    this.startNode = start.nodeId;
    this.endNode = end.nodeId;
    this.startAnchor = window.nodes.get(start.nodeId)?.anchors?.[
      start.anchorId
    ];
    this.startBBox = window.nodes.get(start.nodeId)?.bbox;
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
    this.startBBox = s?.bbox;
    this.endAnchor = e?.anchors?.[end.anchorId];
    this.endBBox = e?.bbox;
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
    const [_, coords] = ManhattanLayout(s, e, this.startBBox, this.endBBox, 20);
    // const path = `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
    const path = `M ${coords[0].x} ${coords[0].y} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.x} ${coord.y}`;
      })
      .join(" ")}`;
    const v = e.subtract(s);
    const dir = normal.angle(v);
    this.marker = genTriangleMarker(dir, e);
    // this.triangulation = triangulationFn(commandExplain(path));
    return (this.path = path);
  }
}
