// import { schedule } from "./schedule/schedule";
import { RTree } from "./algorithm/RTree";
import { eventProxy } from "./event/eventProxy";
import { EleMap, UpdateQueue } from "./schedule/updateQueue";

export function initialize(brush: any) {
  RTree();
  (window as any)["nodes"] = new EleMap(brush, "nodes");
  (window as any)["edges"] = new EleMap(brush, "edges");
  (window as any)["text"] = new EleMap(brush, "text");
  new UpdateQueue(brush);
  eventProxy(brush);
  // schedule(brush);
}
