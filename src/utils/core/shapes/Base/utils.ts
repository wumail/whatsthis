import { K } from "../../constant";
import { Matrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";

export const OriginAnchor = () => {
  return {
    coords: EllipseCoords(),
    path: "",
  };
};

export const OriginVertex = () => {
  return {
    coords: RectangleCoords(),
    path: "",
  };
};

export function RectangleCoords(width: number = 8, height: number = 8) {
  const halfWidth = (width as number) / 2,
    halfHeight = (height as number) / 2;

  const coords = [
    new Point(-halfWidth, halfHeight),
    new Point(-halfWidth, -halfHeight),
    new Point(halfWidth, -halfHeight),
    new Point(halfWidth, halfHeight),
  ];
  return new Matrix(...coords);
}

export function RectanglePath(coords: Matrix) {
  const tmp = coords.to2D();
  return `M ${tmp[0].join(" ")} ${tmp
    .slice(1)
    .map((coord: any) => {
      return `L ${coord.join(" ")}`;
    })
    .join(" ")} z`;
}

export function EllipseCoords(longAxis: number = 8, shortAxis: number = 8) {
  const lA = (longAxis as number) / 2,
    sA = (shortAxis as number) / 2;
  // 切线的dx dy
  const cpX = (lA as number) * K,
    cpY = (sA as number) * K;

  const part1 = [
    new Point(-lA, 0),
    new Point(-lA, cpY),
    new Point(-cpX, sA),
    new Point(0, sA),
  ];
  const part2 = [new Point(cpX, sA), new Point(lA, cpY), new Point(lA, 0)];
  const part3 = [new Point(lA, -cpY), new Point(cpX, -sA), new Point(0, -sA)];
  const part4 = [new Point(-cpX, -sA), new Point(-lA, -cpY), new Point(-lA, 0)];
  return new Matrix(...part1.concat(part2, part3, part4));
}

export function EllipsePath(coords: Matrix) {
  const tmp = coords.to2D();
  const M = tmp[0];
  const C = tmp.slice(1);
  return `M${M.join(" ")}${(C as any).reduce(
    (prev: string, cur: any[], index: number) => {
      if (index % 3 === 0) {
        return prev + `C${cur.join(" ")} `;
      } else if (index % 3 === 1) {
        return prev + `${cur.join(" ")} `;
      } else {
        return prev + `${cur.join(" ")}`;
      }
    },
    ""
  )}z`;
}

export function StraightLine(start: any, end: any) {
  return `M${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
}
