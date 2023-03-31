import { Matrix, RotateMatrix, TranslateMatrix } from "../../geometry/matrix";
import { Point } from "../../geometry/vector";

export function genBaseTriangle(width?: number, height?: number) {
  const w = width ?? 10;
  const h = height ?? 8;
  return new Matrix(
    new Point(0, 0),
    new Point(-w, h / 2),
    new Point(-w, -h / 2)
  );
}

const baseTriangle = genBaseTriangle();

export function genTriangleMarker(dir: number, p: Point) {
  const r = baseTriangle
    .cross(new RotateMatrix(dir))
    .cross(new TranslateMatrix(p.x, p.y));
  const [p1, p2, p3] = r;
  const path = `M${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`;
  return {
    brush: {
      fillStyle: "#000",
    },
    path,
  };
}
