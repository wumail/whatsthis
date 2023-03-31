import { Point, Vector } from "./vector";
import { Matrix, RotateMatrix, ScaleMatrix, TranslateMatrix } from "./matrix";
import { add, subtract } from "./geometry";

// const a1 = new Point(1, 1);
// const b1 = new Point(2, 2);
// const a2 = new Vector(2, 1, 0);
// const b2 = new Vector(1, 1, 0);
// console.log(a1[0], b1, a2, b2);
// a1.subtract(b1);
// b1.subtract(a1);
// subtract([a1, b1], 0);
// console.log(subtract([a1, b1], 0), add([a1, b1], 0));
// console.log(a2.dot(b2), a2.cross(b2), b2.cross(a2));
// console.log(
//   a2.add(b2),
//   a2.subtract(b2),
//   a1.add(b1),
//   a1.subtract(b1),
//   b1.subtract(a1),
//   add([a1, b1], 0)
// );

const m1 = new Matrix([1, 0, 0], [0, 1, 0], [1, 1, 0]);
const m2 = new ScaleMatrix(2, 2);
// const m2 = new TranslateMatrix(1, 0);
// console.log(m2);
// console.log(m1.transpose());
console.log(m1.cross(m2));
