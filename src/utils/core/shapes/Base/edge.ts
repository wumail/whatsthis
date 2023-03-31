import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";

export abstract class EdgeBase {
  constructor() {}

  abstract genShape(coordinates: number[][] | Point[]): Matrix;

  abstract genPath(): string;
}

let count = 0;

export class Edge extends EdgeBase implements BaseEdge {
  id: string;
  type: string = "edge";
  origin!: Matrix;
  coords!: Matrix;
  path: String = "";
  focus: boolean = false;
  startNode: any;
  endNode: any;
  startAnchor: any;
  endAnchor: any;
  marker: any;

  constructor() {
    super();
    while (window.edges.get(`edge-${count}`)) {
      count++;
    }
    this.id = `edge-${count++}`;
    window.edges.add(this.id, this);
  }
  genShape(coordinates: number[][] | Point[]): Matrix {
    return new Matrix(...coordinates);
  }
  genPath(): string {
    return "";
  }
}
