export class EventBus {
  private events: any;

  constructor() {
    this.events = new Map();
  }

  $on(name: string, fn: Function) {
    let event;
    if (!(event = this.events.get(name))) {
      event = this.events.set(name, []).get(name);
    }
    event.push(fn);
    return event.length - 1;
  }

  $emit(name: string, ...args: any[]) {
    let event;
    (event = this.events.get(name)) &&
      event.forEach((fn: Function) => {
        fn(...args);
      });
  }

  $once(name: any, fn: Function) {
    const cb = (...args: any[]) => {
      fn(...args);
      this.$off(name, fn);
    };
    this.$on(name, cb);
  }

  $off(name: string, index: any) {
    let event;
    if ((event = this.events.get(name))) {
      event.splice(index, 1);
      if (!event.length) {
        this.events.delete(name);
      }
    }
  }
}
