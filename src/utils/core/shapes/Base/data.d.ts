type TransformType = {
  rotate: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
};

type va = {
  path: string;
  coord: Point;
};

interface BaseNode {
  id: string;
  type: string;
  origin: Matrix | undefined;
  coords: Matrix;
  path: string;
  transformation: TransformType;
  bbox: any;
  // triangulation: any;
  text: string;
  center: Point;
  focus: boolean;
  anchors: any;
  vertexes: any;
  borders: any;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface BaseEdge {
  id: string;
  type: string;
  origin: Matrix;
  coords: Matrix;
  path: String;
  startNode: any;
  endNode: any;
  startAnchor: Point;
  endAnchor: Point;
  focus: boolean;
  marker: any;
}
