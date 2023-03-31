import { Point } from "../archive/vector";

export class UnionFind {
  //   private parents: any;
  private _parents: Map<any, any>;
  //   private ranks: any;
  private _ranks: Map<any, any>;
  constructor() {
    this._parents = new Map();
    this._ranks = new Map();
    // this.parents = Array(size)
    //   .fill(0)
    //   .map((_, i) => i); // 存储元素父节点信息
    // this.ranks = Array(size).fill(1); // 存储元素秩信息
  }
  find(x: any) {
    // 查询操作
    if (x !== this._parents.get(x)) {
      this._parents.set(x, this.find(this._parents.get(x)));
    }
    return this._parents.get(x);
    // if (x !== this.parents[x]) {
    //   this.parents[x] = this.find(this.parents[x]); // 递归并进行路径压缩
    // }
    // return this.parents[x];
  }
  add(obj: any) {
    if (!this._parents.get(obj)) {
      this._parents.set(obj, obj);
      this._ranks.set(obj, 1);
    }
  }
  union(x: any, y: any) {
    // 合并操作
    const _px = this.find(x);
    const _py = this.find(y);
    if (_px === _py) return;
    if (this._ranks.get(_px) > this._ranks.get(_py)) {
      this._parents.set(_py, _px);
      this._ranks.set(_px, this._ranks.get(_px) + this._ranks.get(_py));
    } else {
      this._parents.set(_px, _py);
      this._ranks.set(_py, this._ranks.get(_py) + this._ranks.get(_px));
    }
    // const px = this.find(x);
    // const py = this.find(y);
    // if (px === py) return;
    // // 按秩合并
    // if (this.ranks[px] > this.ranks[py]) {
    //   this.parents[py] = px;
    //   this.ranks[px] += this.ranks[py];
    // } else {
    //   this.parents[px] = py;
    //   this.ranks[py] += this.ranks[px];
    // }
  }
}

export function includePoint(point: Point, shape: any) {
  const { type } = shape;
  switch (type) {
    case "ellipse":
      break;
    case "polygon":
      break;
    case "path":
      break;
    case "ellipse":
      break;
    case "ellipse":
      break;
    default:
      break;
  }
}
