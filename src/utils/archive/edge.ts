import { Matrix } from "./matrix";

export type EdgeData = {
  instance: any;
  bbox: Matrix;
  startAnchor: string;
  endAnchor: string;
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
