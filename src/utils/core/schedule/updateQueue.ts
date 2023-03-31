import { Matrix } from "../geometry/matrix";
import { Point } from "../geometry/vector";
import { Ellipse, Polygon, Polyline, Rectangle, StraightLine } from "../shapes";
import { redraw } from "./schedule";

export class EleMap {
  private eleMap: Map<any, any>;
  private brush;
  private type: string;
  constructor(brush: any, type: string) {
    this.eleMap = new Map();
    this.brush = brush;
    this.type = type;
  }
  add(id: any, instance: any) {
    this.set(id, instance);
  }
  delete(id: any) {
    this.eleMap.delete(id);
  }
  get(id: any) {
    return this.eleMap.get(id);
  }
  set(id: any, value: any) {
    this.eleMap.set(id, value);
    window.updateQueue.push(value);
    requestAnimationFrame(redraw(this.brush));
  }
  entries() {
    return this.eleMap.entries();
  }
  values() {
    const iterator = this.eleMap.values();
    let val;
    const res = [];
    while ((val = iterator.next().value)) {
      res.push(val);
    }
    return res;
  }
  output() {
    const tmp: any = [];
    this.eleMap.forEach((v: any) => {
      tmp.push(v);
    });
    return JSON.stringify(tmp);
  }
  input(data: any) {
    const needToTranslate: any = {
      coord: "Point",
      coords: "Matrix",
      origin: "Matrix",
      matrix: "Matrix",
      center: "Point",
    };
    const d = JSON.parse(data);
    d.forEach((i: any) => {
      const fn = (obj: any) => {
        const keys = Object.keys(obj);
        keys.forEach((key: string) => {
          const o = obj[key];
          if (key === "startAnchor") {
            obj[key] = window.nodes.get(obj.startNode)?.anchors?.[o.id];
          } else if (key === "endAnchor") {
            obj[key] = window.nodes.get(obj.endNode)?.anchors?.[o.id];
          } else {
            let type = "";
            if (Array.isArray(o) && (type = needToTranslate[key])) {
              switch (type) {
                case "Point": {
                  obj[key] = new Point(o[0], o[1]);
                  break;
                }
                case "Matrix": {
                  obj[key] = new Matrix(...o);
                  break;
                }
                default:
                  break;
              }
            } else if (
              Object.prototype.toString.call(o) === "[object Object]"
            ) {
              fn(o);
            }
          }
        });
      };
      fn(i);
      changePrototype(i);
      const { id } = i;
      let count = +id.split("-")[1];
      while (this.get(`edge-${count}`)) {
        count++;
      }
      this.add(`edge-${count}`, i);
    });
  }
}

export class LinkList {
  brush: any;
  virtualHead: any;
  cur: any;
  constructor(brush: any) {
    this.brush = brush;
    this.virtualHead = {
      next: null,
    };
  }
  push(data: any) {
    if (this.virtualHead.next === null) {
      this.virtualHead.next = {
        data,
        next: null,
      };
    } else {
      this.cur.next = {
        data,
        next: null,
      };
    }
    this.cur = {
      data,
      next: null,
    };
  }
  shift() {
    console.log("updateQueue::shift");
    const head = this.virtualHead.next;
    if (head === null) return null;
    const newHead = head.next;
    this.virtualHead.next = newHead;
    return head;
  }
  clear() {
    this.virtualHead.next = this.cur = null;
  }
}

export class UpdateQueue {
  constructor(brush: any) {
    window.updateQueue = new LinkList(brush);
  }
}

function changePrototype(i: any) {
  switch (i.type) {
    case "ellipse": {
      Object.setPrototypeOf(i, Ellipse.prototype);
      break;
    }
    case "polygon": {
      Object.setPrototypeOf(i, Polygon.prototype);
      break;
    }
    case "rectangle": {
      Object.setPrototypeOf(i, Rectangle.prototype);
      break;
    }
    case "polyline": {
      Object.setPrototypeOf(i, Polyline.prototype);
      break;
    }
    case "straight": {
      Object.setPrototypeOf(i, StraightLine.prototype);
      break;
    }
    default:
      break;
  }
}
