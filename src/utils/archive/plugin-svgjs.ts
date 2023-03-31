import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";
import "@svgdotjs/svg.draggable.js";
import { Point, Vector } from "./vector";
import { TranslateMatrix, RotateMatrix, Matrix, ScaleMatrix } from "./matrix";

type Key = number | string;

export const D = +((4 / 3) * (Math.sqrt(2) - 1)).toFixed(5);

export class SvgJs {
  private container: string;
  private sketchpad: any;

  public brush: any;
  public width: number;
  public height: number;

  constructor(container: string, width?: number, height?: number) {
    this.container = container;
    this.width = width || 400;
    this.height = height || 300;
    this.brush = SVG().addTo(container);
    this.sketchpad = this.drawSketchpad();
  }

  pathGenerator(type: string, coords: number[][] | Point[]) {
    switch (type) {
      case "ellipse": {
        const M = coords[0];
        const C = coords.slice(1, 4);
        const S = coords.slice(4);
        return `M ${M.join(" ")} C ${C.map((c) => c.join(" ")).join(", ")} ${(
          S as any
        ).reduce((prev: string, cur: any[], index: number) => {
          if (index % 2 === 0) {
            return prev + `S ${cur.join(" ")}, `;
          } else {
            return prev + `${cur.join(" ")} `;
          }
        }, "")}z`;
      }
      case "polygon": {
        return `M ${coords[0].join(" ")} ${coords
          .slice(1)
          .map((coord: any) => {
            return `L ${coord.join(" ")}`;
          })
          .join(" ")}
        z`;
      }
      case "polyline": {
        return `M ${coords[0].join(" ")} ${coords
          .slice(1)
          .map((coord: any) => {
            return `L ${coord.join(" ")}`;
          })
          .join(" ")}
        `;
      }
      default:
        break;
    }
  }

  drawSketchpad() {
    return this.brush
      .size(this.width, this.height)
      .rect(this.width, this.height)
      .attr({ fill: "#fff" });
  }

  resizeSketchpad({ width, height }: { width: number; height: number }) {
    this.width = width || this.width;
    this.height = height || this.height;
    this.sketchpad.clear();
    this.sketchpad = this.drawSketchpad();
  }

  drawEllipse(
    longAxis: number,
    shortAxis: number,
    center: Point,
    ifAnchor?: boolean
  ) {
    // 切线的dx dy
    const cpX = longAxis * +D,
      cpY = shortAxis * +D;

    const tM = new TranslateMatrix(center[0], center[1]);

    const part1 = [
      new Point(-longAxis, 0),
      new Point(-longAxis, cpY),
      new Point(-cpX, shortAxis),
      new Point(0, shortAxis),
    ];
    const part2 = [new Point(longAxis, cpY), new Point(longAxis, 0)];
    const part3 = [new Point(cpX, -shortAxis), new Point(0, -shortAxis)];
    const part4 = [new Point(-longAxis, -cpY), new Point(-longAxis, 0)];
    const coords = new Matrix(...part1.concat(part2, part3, part4)).cross(tM);

    const path = this.pathGenerator("ellipse", coords.to2D());
    const shape = this.sketchpad
      .path(path)
      .fill("transparent")
      .stroke({ color: "#000", width: 2 });
    // !ifAnchor && this.addNode(shape, "node", "ellipse");
    return { shape, coords };
  }

  drawCircle(radius: number, center: Point, ifAnchor?: boolean) {
    return this.drawEllipse(radius, radius, center, ifAnchor);
  }

  drawPolygon(
    coords: number[][] | Point[],
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    let finalCoord = coords.map((coord: any) => [coord[0], coord[1]]);
    const path = this.pathGenerator("polygon", finalCoord);
    const shape = this.brush
      .path(path)
      .fill("transparent")
      .stroke({ color: "#000", width: 2 });
    const bbox = this.getBoundaryBox(shape);
    const h = (bbox[0].subtract(bbox[1]) as Vector).getLength();
    const w = (bbox[0].subtract(bbox[3]) as Vector).getLength();
    if (center) {
      const vertex = [center.x - w / 2, center.y - h / 2];
      shape.move(vertex[0], vertex[1]);
    }
    return { shape, coords: finalCoord };
  }

  drawRectangle(
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
    const bbox = [
      new Point(-width / 2, height / 2),
      new Point(-width / 2, -height / 2),
      new Point(width / 2, -height / 2),
      new Point(width / 2, height / 2),
    ];
    return this.drawPolygon(bbox, {
      center,
      ifVertex,
    });
  }

  drawSquare(
    width: number,
    {
      center,
      ifVertex,
    }: {
      center?: Point;
      ifVertex?: boolean;
    }
  ) {
    return this.drawRectangle(width, width, {
      center,
      ifVertex,
    });
  }

  drawTriangle(
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
    const coords = [
      new Point(0, 0),
      new Point(-width / 2, height / 2),
      new Point(-width / 2, -height / 2),
    ];
    return this.drawPolygon(coords, {
      center,
      ifVertex,
    });
  }

  drawPolyline(coords: number[][] | Point[]) {
    const path = this.pathGenerator("polyline", coords);
    const shape = this.sketchpad
      .polyline(path)
      .fill("transparent")
      .stroke({ color: "#000", width: 2, linecap: "round", linejoin: "round" });
    return { shape, coords };
  }

  drawStraightLine(start: Point, end: Point) {
    return this.drawPolyline([start, end]);
  }

  drawLineMarker(
    coords: number[][] | Point[],
    direction: Vector,
    end: number[] | Point
  ) {
    const normal = new Vector(1, 0);
    const angle = normal.angle(direction);
    const rm = new RotateMatrix(angle);
    const tm = new TranslateMatrix(end[0], end[1]);
    const result = new Matrix(...coords)
      .cross(rm)
      .cross(tm)
      .map((mat: any) => [mat[0], mat[1]]);
    return this.drawPolygon(result, {});
  }

  getBoundaryBox(shape: any): any {
    const bbox = shape.bbox();
    const arr = [
      [bbox.x, bbox.y],
      [bbox.x, bbox.y2],
      [bbox.x2, bbox.y2],
      [bbox.x2, bbox.y],
    ];
    return arr.map((item: any) => {
      return new Point(item[0], item[1]);
    });
  }

  getAnchor(bbox: Point[]): any {
    return {
      "#1": bbox[0].add(bbox[1]),
      "#2": bbox[1].add(bbox[2]),
      "#3": bbox[2].add(bbox[3]),
      "#4": bbox[3].add(bbox[0]),
    };
  }
}
