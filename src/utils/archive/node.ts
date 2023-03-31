export class Nodes {
  private nodeMap: Map<any, any>;
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
