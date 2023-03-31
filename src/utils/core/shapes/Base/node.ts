import {
  Matrix,
  RotateMatrix,
  ScaleMatrix,
  TranslateMatrix,
} from "../../geometry/matrix";
import { Point } from "../../geometry/vector";
import {
  EllipseCoords,
  EllipsePath,
  RectangleCoords,
  RectanglePath,
  StraightLine,
} from "./utils";

let count = 0;

function originObj() {
  return {
    "#1": {},
    "#2": {},
    "#3": {},
    "#4": {},
  };
}

export abstract class NodeBase {
  constructor() {}

  abstract genShape(longAxis: number, shortAxis: number): Matrix;
  abstract genShape(coordinates: number[][] | Point[]): Matrix;
  abstract genShape(width: number, height: number): Matrix;

  // 变换，只做计算，不改变path
  abstract transformByMatrix(): Matrix;

  abstract genPath(): string;

  // 改变path
  abstract transformPath(): string;

  abstract getBoundaryBox(): any;

  abstract rotate(angle: number): any;
  abstract translate(tx: number, ty: number): any;
  abstract scale(sx: number, sy: number): any;
}

export class Node extends NodeBase implements BaseNode {
  id: string = "";
  type: string = "node";
  origin: any = undefined;
  coords: any;
  path: string = "";
  transformation: TransformType = {
    rotate: 0,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
  };
  bbox: any = {};
  text: string = "";
  // triangulation: any = [];
  center: Point = new Point(0, 0);
  focus: boolean = false;
  anchors: any = originObj();
  vertexes: any = originObj();
  borders: any;
  minX: number = 0;
  minY: number = 0;
  maxX: number = 0;
  maxY: number = 0;

  constructor() {
    super();
    this.id = `node-${count++}`;
    window.nodes.add(this.id, this);
  }

  genShape(longAxis: number, shortAxis: number): Matrix;
  genShape(coordinates: number[][] | Point[]): Matrix;
  genShape(): Matrix {
    return new Matrix();
  }

  transformByMatrix(): Matrix {
    const { sx, sy, rotate, tx, ty } = this.transformation;
    const matrixes = [];
    if (rotate) {
      matrixes.push(new RotateMatrix(rotate));
    }
    if (sx || sy) {
      matrixes.push(new ScaleMatrix(sx, sy));
    }
    if (tx || ty) {
      matrixes.push(new TranslateMatrix(tx, ty));
    }
    return matrixes.reduce((prev, cur) => {
      return prev.cross(cur);
    }, this.origin);
  }

  genPath(): string {
    return "";
  }

  transformPath(): string {
    this.coords = this.transformByMatrix();
    this.bbox = this.getBoundaryBox();
    this.vab();
    return this.genPath();
  }

  getBoundaryBox(): any {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.coords.forEach((coord: any) => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });

    const coords = [
      new Point(minX, minY),
      new Point(minX, maxY),
      new Point(maxX, maxY),
      new Point(maxX, minY),
    ];

    this.center = coords[0].add(coords[2]);

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;

    window.tree.remove(this);
    window.tree.insert(this);

    return {
      matrix: new Matrix(...coords),
      minX,
      maxX,
      minY,
      maxY,
    };
  }

  rotate(angle: number) {
    this.transformation.rotate += angle;
    this.transformPath();
    window.nodes.set(this.id, this);
    window.updateQueue.push(this);
    return this;
  }

  translate(tx: number, ty: number) {
    this.transformation.tx = tx;
    this.transformation.ty = ty;
    this.transformPath();
    window.nodes.set(this.id, this);
    window.updateQueue.push(this);
    return this;
  }

  scale(sx: number, sy?: number) {
    this.transformation.sx += sx;
    this.transformation.sy += sy ?? sx;
    this.transformPath();
    window.nodes.set(this.id, this);
    window.updateQueue.push(this);
    return this;
  }

  vab() {
    const [p1, p2, p3, p4] = this.bbox.matrix.map((b: any) => {
      return new Point(b[0], b[1]);
    });
    const c1 = p1.add(p2);
    const c2 = p2.add(p3);
    const c3 = p3.add(p4);
    const c4 = p4.add(p1);
    this.genVertexes([p1, p2, p3, p4]);
    this.genAnchors([c1, c2, c3, c4]);
    this.borders = this.genBorder([p1, p2, p3, p4]);
  }

  genVertexes(points: Point[]) {
    return points.map((p: Point, index: number) => {
      const cd = RectangleCoords().cross(new TranslateMatrix(p.x, p.y));
      const path = RectanglePath(cd);
      const coord = p;
      const vertex = this.vertexes[`#${index + 1}`];
      vertex.path = path;
      vertex.coord = coord;
      vertex.id = `#${index + 1}`;
      return {
        coord,
        path,
      };
    });
  }

  genAnchors(points: Point[]) {
    return points.map((p: Point, index: number) => {
      const cd = EllipseCoords().cross(new TranslateMatrix(p.x, p.y));
      const path = EllipsePath(cd);
      const coord = p;
      const anchor = this.anchors[`#${index + 1}`];
      anchor.path = path;
      anchor.coord = coord;
      anchor.id = `#${index + 1}`;
      return {
        coord: p,
        path: cd,
      };
    });
  }

  genBorder(points: Point[]) {
    const length = points.length;
    return points.map((item: any, index: number, arr: any) => {
      return {
        path: StraightLine(item, arr[(index + 1) % length]),
      };
    });
  }
}
