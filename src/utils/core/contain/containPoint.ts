import { EPSILON } from "../constant";
import { Point, Vector } from "../geometry/vector";
import { Ellipse, Polygon, Rectangle } from "../shapes";

export function windowToLocal(event: any) {
  const bbox = (
    document.querySelector("canvas") as any
  ).getBoundingClientRect();
  return new Point(event.clientX - bbox.left, event.clientY - bbox.top);
}

export function containPoint(p: Point, instance: any) {
  if (
    p.x < instance.bbox.minX ||
    p.x > instance.bbox.maxX ||
    p.y < instance.bbox.minY ||
    p.y > instance.bbox.maxY
  ) {
    return false;
  }

  for (let i = 0; i < instance.triangulation.length; i++) {
    const [p1, p2, p3] = instance.triangulation[i];
    const xV = new Vector(p3.x - p1.x, p2.x - p1.x, p1.x - p.x);
    const yV = new Vector(p3.y - p1.y, p2.y - p1.y, p1.y - p.y);
    const u = yV.cross(xV);
    let n;
    if (u.z > EPSILON) {
      n = new Vector(1 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z);
    } else {
      n = new Vector(-1, 1, 1);
    }
    if (n.x < 0 || n.y < 0 || n.z < 0) {
      continue;
    }
    return true;
  }
  return false;
}

export function containPointByShape(p: Point, shape: any) {
  if (shape instanceof Ellipse) {
    return isEllipseContainPoint(shape, p);
  }
  return isPolygonContainPoint(shape, p);
}

export function isEllipseContainPoint(shape: any, p: Point) {
  const { longAxis, shortAxis, center } = shape;
  const a = longAxis / 2;
  const b = shortAxis / 2;
  const cx = center.x;
  const cy = center.y;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1;
}

export function isRectangleContainPoint(shape: any, p: Point) {
  const { width, height, center } = shape;
  return (
    p.x >= center.x - width / 2 &&
    p.x <= center.x + width / 2 &&
    p.y >= center.y - height / 2 &&
    p.y <= center.y + height / 2
  );
}

export function isPolygonContainPoint(shape: any, p: Point) {
  const { coords } = shape;
  let ray = {
    x: p.x,
    y: p.y,
  };

  let intersections = 0;
  for (let i = 0; i < coords.length; i++) {
    let p1 = coords[i];
    let p2 = coords[(i + 1) % coords.length];

    if (
      ray.y > Math.min(p1[1], p2[1]) &&
      ray.y <= Math.max(p1[1], p2[1]) &&
      ray.x <= Math.max(p1[0], p2[0]) &&
      p1[1] !== p2[1]
    ) {
      let xIntersect =
        ((ray.y - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]) + p1[0];
      if (p1[0] === p2[0] || ray.x <= xIntersect) {
        intersections++;
      }
    }
  }

  return intersections % 2 === 1;
}
