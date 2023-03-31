import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";
import "@svgdotjs/svg.draggable.js";
import { Point, Vector } from "./vector";
import { TranslateMatrix, RotateMatrix, Matrix, ScaleMatrix } from "./matrix";
import { Nodes } from "./node";
import { Edges } from "./edge";
import { D } from "./plugin-svgjs";

type NS = number | string;

export class LogicFlow {
  public sketchpad: any;
  private width: NS;
  private height: NS;
  private nodeMap: Nodes;
  private edgeMap: Edges;
  private nodeCount: number;
  private edgeCount: number;
  constructor(target: string, width: NS, height: NS) {
    this.width = width;
    this.height = height;
    this.sketchpad = SVG().addTo(target);
    this.drawSketchpad();
    this.nodeMap = new Nodes();
    this.edgeMap = new Edges();
    this.nodeCount = 0;
    this.edgeCount = 0;
    (window as any).curSVG = undefined;
    (window as any).svgClicked = false;
    (window as any).isDragging = undefined;
    window.addEventListener(
      "click",
      (e: any) => {
        e.stopPropagation();
        if (e.target !== (window as any).curSVG) {
          const id = (window as any).curSVG?.id;
          if (id && (id.includes("node") || id.includes("edge"))) {
            const type = id.split("-")[0];
            this.removeNode(`${type}Map`, id);
            (window as any).curSVG = undefined;
            (window as any).svgClicked = false;
            (window as any).isDragging = false;
          }
        }
      },
      {
        passive: true,
      }
    );
  }
  drawSketchpad() {
    this.sketchpad
      .size(this.width, this.height)
      .rect(this.width, this.height)
      .attr({ fill: "#fff" });
  }
  resetWidth(w: NS) {
    this.width = w;
    this.drawSketchpad();
  }
  resetHeight(h: NS) {
    this.height = h;
    this.drawSketchpad();
  }
  resizeSketchpad(w?: NS, h?: NS) {
    const width = w ?? this.width;
    const height = h ?? this.height;
    this.width = width;
    this.height = height;
    this.drawSketchpad();
  }

  removeNode(mapType: string, id: string) {
    const { bbox, vertex: v1, anchor: a1 } = (this as any)[mapType].get(id);
    bbox && bbox.remove();
    v1 &&
      v1.forEach((v: any) => {
        v.remove();
      });
    a1 &&
      a1.forEach((a: any) => {
        a.remove();
      });
  }
  removeAnchor(mapType: string, id: string) {
    const { anchor: a1 } = (this as any)[mapType].get(id);
    a1 &&
      a1.forEach((a: any) => {
        a.remove();
      });
  }
  removeVertex(mapType: string, id: string) {
    const { vertex: v1 } = (this as any)[mapType].get(id);
    v1 &&
      v1.forEach((v: any) => {
        v.remove();
      });
  }

  addNode(instance: any, mark: string, type: string) {
    const mapType = `${mark}Map`;
    const countType = `${mark}Count`;
    const id = `${mark}-${(this as any)[countType]}`;
    instance.attr("id", id);
    (this as any)[countType]++;
    (this as any)[mapType].add(id, {
      instance: instance,
      type: type,
      bbox: undefined,
      anchor: undefined,
      vertex: undefined,
    });
    instance.draggable();
    instance.on("mouseenter", (event: any) => {
      this.removeAnchor(mapType, id);
      !(window as any).isDragging && this.showAnchor(event.target.instance, id);
    });
    instance.on("mouseleave", (event: any) => {
      !(
        (window as any).svgClicked &&
        (window as any).curSVG.instance === instance
      ) && this.removeAnchor(mapType, id);
    });
    instance.on("dragend click", (event: any) => {
      event.stopPropagation();
      const prevId = (window as any).curSVG?.id;
      if (prevId && (prevId.includes("edge") || prevId.includes("node"))) {
        const type = prevId.split("-")[0];
        this.removeNode(`${type}Map`, prevId);
        (window as any).curSVG = undefined;
        (window as any).svgClicked = false;
      }
      (window as any).curSVG = event.target;
      (window as any).svgClicked = true;
      (window as any).isDragging = false;
      this.showBoundaryBox(event.target.instance, id);
      this.showAnchor(event.target.instance, id);
      this.showVertex(event.target.instance, id);
    });
    instance.on("beforedrag", (event: any) => {
      this.removeNode(mapType, id);
      (window as any).isDragging = true;
    });
  }

  pathGenerator(type: string, coords: number[][] | Point[] | Matrix) {
    switch (type) {
      case "ellipse": {
        const M = coords[0];
        const C = coords.slice(1, 4);
        const S = coords.slice(4);
        return `M ${M.join(" ")} C ${C.map((c) => c.join(" ")).join(
          ", "
        )} ${S.reduce((prev, cur, index) => {
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
          .join(" ")} z`;
      }
      case "polyline": {
        return `M ${coords[0].join(" ")} ${coords.slice(1).map((coord: any) => {
          return `L ${coord.join(" ")}`;
        })}
        `;
      }
      default:
        break;
    }
  }

  drawEllipse(
    longAxis: number,
    shortAxis: number,
    center: number[],
    ifAnchor?: boolean
  ) {
    // const newCenter = [center[0] - longAxis / 2, center[1] - shortAxis / 2];
    // const tmp = this.sketchpad
    //   .ellipse(longAxis, shortAxis)
    //   .fill("transparent")
    //   .move(newCenter[0], newCenter[1])
    //   .stroke({ color: "#000", width: 2 });
    // 切线的dx dy
    const cpX = longAxis * +D,
      cpY = shortAxis * +D;
    // 四段圆弧
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
    const coords = new Matrix(...part1.concat(part2, part3, part4));
    const path = this.pathGenerator("ellipse", coords.cross(tM).to2D());
    const tmp = this.sketchpad
      .path(path)
      .fill("transparent")
      .stroke({ color: "#000", width: 2 });
    !ifAnchor && this.addNode(tmp, "node", "ellipse");
    return tmp;
  }

  drawRectangle(
    width: number,
    height: number,
    center: number[],
    ifVertex?: boolean
  ) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const newCenter = [center[0] - halfWidth, center[1] - halfHeight];
    const tmp = this.sketchpad
      .polygon([
        [halfWidth, halfHeight],
        [-halfWidth, halfHeight],
        [-halfWidth, -halfHeight],
        [halfWidth, -halfHeight],
      ])
      .fill("transparent")
      .move(newCenter[0], newCenter[1])
      .stroke({ color: "#000", width: 2 });
    !ifVertex && this.addNode(tmp, "node", "rectangle");
    return tmp;
  }

  drawPolygon(coordinates: number[][], vertex?: number[]) {
    const tmp = this.sketchpad
      .polygon(coordinates)
      .fill("transparent")
      .stroke({ color: "#000", width: 2 });
    vertex && tmp.move(vertex?.[0] || 0, vertex?.[1] || 0);
    this.addNode(tmp, "node", "polygon");
    return tmp;
  }

  drawTriangle(
    v1: Vector,
    coordinate: number[],
    width: number,
    height: number
  ) {
    const angle = new Vector(1, 0).angle(v1);
    const m1 = new Matrix(
      [0, 0, 1],
      [-width, height / 2, 1],
      [-width, -height / 2, 1]
    );
    const tM = new TranslateMatrix(coordinate[0], coordinate[1]);
    const rM = new RotateMatrix(angle);
    const r = m1.cross(rM).cross(tM).to2D();
    return this.sketchpad
      .path(
        `M${r[0].join(" ")} L${r
          .slice(1)
          .map((item: any) => {
            return item[0] + " " + item[1];
          })
          .join(",")} z`
      )
      .stroke({ color: "#000", width: 2 });
  }

  drawStraightLine(start: Point, end: Point) {
    const tmp = this.sketchpad
      .path(`M${start.x} ${start.y} L ${end.x} ${end.y}`)
      .stroke({ color: "#000", width: 2 });
    const ne = new Point(end.x, -end.y),
      ns = new Point(start.x, -start.y);
    this.drawTriangle(ne.subtract(ns) as Vector, end, 8, 12);
    this.addNode(tmp, "edge", "straightline");
    return tmp;
  }

  drawPolyline(coordinates: number[][], start?: number[]) {
    const coords = new Matrix(
      ...coordinates.map((item) => [item[0], item[1], 1])
    );
    // const ttM = new TranslateMatrix(start[0], start[1]);
    // const p = coords.cross(ttM).to2D();
    const tmp = this.sketchpad
      .polyline(coordinates)
      .fill("transparent")
      .stroke({ color: "#000", width: 2, linecap: "round", linejoin: "round" });
    start && tmp.move(start?.[0] || 0, start?.[1] || 0);
    this.addNode(tmp, "edge", "polyline");
    // const test = (start: any, end: any): any => {
    //   const v1 = new Point(end[0], end[1]).subtract(
    //     new Point(start[0], start[1])
    //   );
    //   const len = (v1 as Vector).getLength();
    //   const tM = new TranslateMatrix(-start[0], -start[1]);
    //   const rM = new RotateMatrix(-Math.PI / 2);
    //   const sM = new ScaleMatrix(4 / len, 4 / len);
    //   console.log(new Matrix(v1).cross(tM).cross(rM));
    //   const rv = new Matrix(v1).cross(tM).cross(rM).cross(sM).to2D()[0];
    //   const rX = rv[0] - start[0],
    //     rY = rv[1] - start[1];
    //   const tM1 = new TranslateMatrix(rX, rY);
    //   const tM2 = new TranslateMatrix(-rX, -rY);
    //   const b1 = coords.cross(tM1).cross(ttM).to2D();
    //   const b2 = coords.cross(tM2).cross(ttM).to2D().reverse();
    //   const result = [b1.concat(b2)];
    //   return result;
    // };
    // const path = this.pathGenerator(
    //   "polygon",
    //   test(coordinates[0], coordinates[1])
    // );
    // this.sketchpad
    //   .path(path)
    //   .fill("none")
    //   .stroke({ color: "#ccc", width: 2, "stroke-dasharray": 2 });
    return tmp;
  }

  showBoundaryBox(instance: any, id: string) {
    let map;
    if (id.includes("edge")) {
      map = this.edgeMap.get(id);
    } else {
      map = this.nodeMap.get(id);
    }
    const ib = instance.bbox();
    const arr = [
      [ib.x, ib.y],
      [ib.x, ib.y2],
      [ib.x2, ib.y2],
      [ib.x2, ib.y],
    ];
    const tmp = this.drawBoundaryBox(arr);
    map.bbox = tmp;
  }

  drawBoundaryBox(arr: any) {
    const tmp = this.sketchpad
      .path(
        `M${arr[0].join(" ")} L${arr
          .slice(1)
          .map((item: any) => {
            return item[0] + " " + item[1];
          })
          .join(",")} z`
      )
      .attr({
        fill: "none",
        "stroke-width": 1,
        stroke: "#ccc",
        "stroke-dasharray": 2,
      });
    return tmp;
  }

  getBarycentricCoordinates(instance: any) {
    const bbox = instance.bbox();
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
  }

  showVertex(instance: any, id: string) {
    let map;
    if (id.includes("edge")) {
      map = this.edgeMap.get(id);
    } else {
      map = this.nodeMap.get(id);
    }
    const ib = instance.bbox();
    const arr = [
      [ib.x, ib.y],
      [ib.x, ib.y2],
      [ib.x2, ib.y2],
      [ib.x2, ib.y],
    ];
    map.vertex = this.drawVertex(arr, instance);
  }

  showAnchor(instance: any, id: string) {
    let map;
    if (id.includes("edge")) {
      map = this.edgeMap.get(id);
    } else {
      map = this.nodeMap.get(id);
    }
    const ib = instance.bbox();
    const arr = [
      [ib.x, ib.y],
      [ib.x, ib.y2],
      [ib.x2, ib.y2],
      [ib.x2, ib.y],
    ];
    map.anchor = this.drawAnchor(arr);
  }

  drawVertex(bbox: any, instance?: any) {
    const bboxCenter = new Point(bbox[0][0], bbox[0][1]).add(
      new Point(bbox[2][0], bbox[2][1])
    );
    const xy: any = {
      origin: [],
      cur: [],
    };
    const vertex: any = [];
    let width = 6,
      height = 6;
    bbox.map((item: any) => {
      const center = new Point(item[0] - width / 2, item[1] - height / 2);
      const tmp = this.sketchpad
        .rect(width, height)
        .fill("#fff")
        .move(center.x, center.y)
        .stroke({ color: "#000", width: 1 });
      vertex.push(tmp);
      tmp.draggable();
      tmp.on("beforedrag", (event: any) => {
        const originPoint = new Point(
          event.target.instance.x() + width / 2,
          event.target.instance.y() + height / 2
        );
        xy.origin = originPoint.subtract(bboxCenter);
      });
      tmp.on("dragend", (event: any) => {
        const curPoint = new Point(
          event.target.instance.x() + width / 2,
          event.target.instance.y() + height / 2
        );
        xy.cur = curPoint.subtract(bboxCenter);
        const scaleX = xy.cur.x / xy.origin.x,
          scaleY = xy.cur.y / xy.origin.y;
        // const nBW = (bbox[3][0] - bbox[0][0]) * scaleX,
        //   nBH = (bbox[1][1] - bbox[0][1]) * scaleY;
        // this.sketchpad
        //   .rect(nBW, nBH)
        //   .fill("none")
        //   .move(bboxCenter.x - nBW / 2, bboxCenter.y - nBH / 2)
        //   .stroke({ color: "red", width: 1, dasharray: 2 });
        // instance.clear()
        // const t = this.nodeMap.get(instance.id());
        // console.log(instance.id());
        this.showBoundaryBox(instance, instance.id());
      });
    });
    return vertex;
  }

  drawAnchor(bbox: any) {
    const anchor: any = [];
    const points = bbox.map((item: any) => {
      return new Point(item[0], item[1]);
    });
    const matrixes = [
      new Matrix(points[0].add(points[1])).to2D(),
      new Matrix(points[1].add(points[2])).to2D(),
      new Matrix(points[2].add(points[3])).to2D(),
      new Matrix(points[3].add(points[0])).to2D(),
    ];
    let longAxis = 4,
      shortAxis = 4;
    matrixes.forEach((item) => {
      const center = new Point(
        item[0][0] - longAxis / 2,
        item[0][1] - shortAxis / 2
      );
      const tmp = this.sketchpad
        .ellipse(longAxis, shortAxis)
        .fill("#fff")
        .move(center.x, center.y)
        .stroke({ color: "#000", width: 1 });
      anchor.push(tmp);
      tmp.on("mouseenter", (event: any) => {
        tmp.scale(2);
      });
      tmp.on("mouseleave", (event: any) => {
        tmp.scale(1 / 2);
      });
    });
    return anchor;
  }
}
