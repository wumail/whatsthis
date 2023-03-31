import { type } from "./geometry";
import { Matrix } from "./matrix";
import { Point } from "./vector";

type nodeType =
  | "ellipse"
  | "rectangle"
  | "polygon"
  | "triangle"
  | "square"
  | "circle";

export class EleMap {
  private eleMap: Map<any, any>;
  constructor() {
    const proxyToRaw = new WeakMap();
    const interceptors = {
      get(key: string) {
        const rawTarget = proxyToRaw.get(this);
        return rawTarget.get(key);
      },
      set(key: string, value: any) {
        const rawTarget = proxyToRaw.get(this);
        return rawTarget.set(key, value);
      },
    };
    const createProxy = (obj: any) => {
      const proxy = new Proxy(new Map(), {
        get(target, key, receiver) {
          return Reflect.get(target, key, receiver).bind(target); // bind this
        },
      });
      proxyToRaw.set(proxy, obj);
      return proxy;
    };
    this.eleMap = createProxy(new Map());
  }
  add(id: any, instance: any) {
    this.eleMap.set(id, instance);
    // addToUpdateQueue
  }
  delete(id: any) {
    this.eleMap.delete(id);
  }
  get(id: any) {
    return this.eleMap.get(id);
  }
  set(id: any, value: any) {
    this.eleMap.set(id, value);
    // addToUpdateQueue
  }
}

export class LinkList {
  virtualHead: any;
  cur: any;
  constructor() {
    this.virtualHead = {
      next: null,
    };
  }
  push(data: any) {
    if (this.virtualHead === null) {
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
    const head = this.virtualHead.next;
    if (head === null) return null;
    const newHead = head.next;
    this.virtualHead.next = newHead;
    return head;
  }
}

export class UpdateQueue {
  constructor() {
    (window as any).updateQueue = new LinkList();
  }
}
