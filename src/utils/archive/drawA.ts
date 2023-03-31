import { type } from "./geometry";
import { Matrix, ScaleMatrix } from "./matrix";
import { Point } from "./vector";

type nodeType =
  | "ellipse"
  | "rectangle"
  | "polygon"
  | "triangle"
  | "square"
  | "circle";
type edgeType = "straightLine" | "polyline" | "bezier";
type shapes = nodeType | edgeType;

type instanceType = {
  drawEllipse: Function;
  drawRectangle: Function;
  drawTriangle: Function;
  drawPolygon: Function;
  drawStraightLine: Function;
  drawPolyline: Function;
  drawBezier: Function;
  [key: string]: any;
};

export type EdgeData = {
  id: string;
  instance: any;
  type: edgeType;
  bbox: Matrix;
  startAnchor: string;
  endAnchor: string;
  params: any;
  attrs: any;
};

export class Edges {
  private edgeMap: Map<any, EdgeData>;
  constructor() {
    this.edgeMap = new Map();
  }
  add(id: any, instance: any) {
    this.edgeMap.set(id, instance);
  }
  delete(id: any) {
    this.edgeMap.delete(id);
  }
  get(id: any) {
    return this.edgeMap.get(id);
  }
  set(id: any, value: any) {
    this.edgeMap.set(id, value);
  }
}

export type NodeData = {
  id: string;
  instance: any;
  type: nodeType;
  bbox: Matrix;
  center: Point;
  params: any;
  anchors: any;
  attrs: any;
};

export class Nodes {
  private nodeMap: Map<any, NodeData>;
  constructor() {
    this.nodeMap = new Map();
  }
  add(id: any, instance: any) {
    this.nodeMap.set(id, instance);
  }
  delete(id: any) {
    this.nodeMap.delete(id);
  }
  get(id: any) {
    return this.nodeMap.get(id);
  }
  set(id: any, value: any) {
    this.nodeMap.set(id, value);
  }
}

export class Ellipse {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(longAxis: number, shortAxis: number, center: Point, ifAnchor?: boolean) {
    const { instance } = this;
    const shape = instance.drawEllipse(longAxis, shortAxis, center, ifAnchor);
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "ellipse",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        longAxis,
        shortAxis,
        center,
      },
    };
  }
}

export class Polygon {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(
    coords: number[][] | Point[],
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    const { instance } = this;
    const shape = instance.drawPolygon(coords, {
      center,
      ifVertex,
    });
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "polygon",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        coords,
        center,
        ifVertex,
      },
    };
  }
}

export class Rectangle {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(
    width: number,
    height: number,
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    const { instance } = this;
    const shape = instance.drawRectangle(width, height, {
      center,
      ifVertex,
    });
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "rectangle",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        width,
        height,
        center,
        ifVertex,
      },
    };
  }
}

export class Square {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(
    width: number,
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    const { instance } = this;
    const shape = instance.drawSquare(width, width, {
      center,
      ifVertex,
    });
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "square",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        width,
        center,
        ifVertex,
      },
    };
  }
}

export class Triangle {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(
    width: number,
    height: number,
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    const { instance } = this;
    const shape = instance.drawTriangle(width, height, {
      center,
      ifVertex,
    });
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "triangle",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        width,
        height,
        center,
        ifVertex,
      },
    };
  }
}

export class StraightLine {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(start: Point, end: Point) {
    const { instance } = this;
    const shape = instance.drawStraightLine(start, end);
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "straightLine",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        start,
        end,
      },
    };
  }
}

export class Polyline {
  public instance: any;
  constructor(instance: any) {
    this.instance = instance;
  }
  draw(coords: number[][] | Point[]) {
    const { instance } = this;
    const shape = instance.drawPolyline(coords);
    const bbox = instance.getBoundaryBox(shape);
    const anchor = instance.getAnchor(bbox);
    return {
      instance: instance,
      type: "polyline",
      bbox,
      anchor,
      center: bbox[0].add(bbox[2]),
      params: {
        coords,
      },
    };
  }
}

export class Sketchpad {
  public brush: any;
  private instance: instanceType;

  private nodeMap: Nodes;
  private edgeMap: Edges;

  private nodeCount: number;
  private edgeCount: number;

  public ellipse: Ellipse;
  public rectangle: Rectangle;
  public polygon: Polygon;
  public triangle: Triangle;
  public square: Square;
  public straightLine: StraightLine;
  public polyline: Polyline;

  constructor(instance: any) {
    this.instance = instance;

    this.nodeMap = new Nodes();
    this.edgeMap = new Edges();

    this.nodeCount = 0;
    this.edgeCount = 0;

    this.ellipse = new Ellipse(instance);
    this.rectangle = new Rectangle(instance);
    this.polygon = new Polygon(instance);
    this.triangle = new Triangle(instance);
    this.square = new Square(instance);
    this.straightLine = new StraightLine(instance);
    this.polyline = new Polyline(instance);
  }
  addEvent(id: string) {
    const scaleRate = 2;
    const type = id.includes("node") ? "node" : "edge";
    const shapeData = this[`${type}Map`].get(id);
    const { instance: shape, center, bbox, anchors }: any = shapeData || {};
    shape.on("click", (e: any) => {
      const { instance: i } = e.target;
      bbox?.forEach((b: any) => {
        const width = 6;
        const { instance }: any = this.draw("square", {
          width,
          center: b,
          ifVertex: true,
        });
        const distance = {
          old: new Point(0, 0),
          new: new Point(0, 0),
        };
        instance.on("dragstart", () => {
          distance.old = b;
        });
        instance.on("dragend", (event: any) => {
          distance.new = new Point(
            event.target.instance.x() + width / 2,
            event.target.instance.y() + width / 2
          );
          const sX = distance.old.x / distance.new.x,
            sY = distance.old.y / distance.new.y;
          const sM = new ScaleMatrix(sX, sY);
        });
      });
      Object.keys(anchors).forEach((key: string) => {
        const { instance }: any = this.draw("ellipse", {
          longAxis: 2,
          shortAxis: 2,
          center: anchors[key],
          ifAnchor: true,
        });
      });
    });
    shape.on("dargstart", () => {});
    shape.on("drageend", () => {});
  }

  addNode(type: "node" | "edge", data: any, id?: string) {
    const { ifAnchor } = data.params;
    const mapType = `${type}Map`,
      countType = `${type}Count`;
    !ifAnchor && data.instance.draggable();
    if (id && (this as any)[mapType].get(id)) {
      (this as any)[mapType].set(id, {
        ...data,
        id,
      });
    } else {
      const newId = `${type}-${(this as any)[countType]}`;
      (this as any)[countType]++;
      (this as any)[mapType].add(id, {
        ...data,
        id: newId,
      });
    }
  }

  redraw(shape: any, { type, params, id }: any) {
    shape.clear();
    this.draw(type, params, id);
  }

  draw(type: shapes, params: any, id?: string) {
    let data;
    switch (type) {
      case "ellipse": {
        const { longAxis, shortAxis, center, ifAnchor } = params;
        data = this.ellipse.draw(longAxis, shortAxis, center, ifAnchor);
        !ifAnchor && this.addNode("node", data, id);
        return data;
      }
      case "rectangle": {
        const { width, height, center, ifVertex } = params;
        data = this.rectangle.draw(width, height, { center, ifVertex });
        !ifVertex && this.addNode("node", data, id);
        return data;
      }
      case "square": {
        const { width, center, ifVertex } = params;
        data = this.square.draw(width, { center, ifVertex });
        !ifVertex && this.addNode("node", data, id);
        return data;
      }
      case "polygon": {
        const { coords, center, ifVertex } = params;
        data = this.polygon.draw(coords, { center, ifVertex });
        !ifVertex && this.addNode("node", data, id);
        return data;
      }
      case "triangle": {
        const { width, height, vertex } = params;
        data = this.triangle.draw(width, height, vertex);
        this.addNode("node", data, id);
        return data;
      }
      case "straightLine": {
        const { start, end } = params;
        data = this.straightLine.draw(start, end);
        this.addNode("edge", data, id);
        return data;
      }
      case "polyline": {
        const { coords } = params;
        data = this.polyline.draw(coords);
        this.addNode("edge", data, id);
        return data;
      }
      default:
        break;
    }
  }
}
