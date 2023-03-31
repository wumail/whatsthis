import { Point, Vector } from "./vector";

export class Matrix extends Array {
  rows: number;
  columns: number;
  constructor(...vectors: any[]) {
    super(vectors.length);
    this.fill(new Array(3));
    vectors.forEach((v: any, index: number) => {
      this[index] = v;
    });
    this.columns = vectors[0].length;
    this.rows = vectors.length;
  }
  getRow(index: number) {
    return this[index];
  }
  getColumn(index: number) {
    return [
      ...this.map((row: Vector) => {
        return row[index];
      }),
    ];
  }
  // 转置
  transpose() {
    // const vectors: any[] = []
    // for(let i = 0; i < this.columns; i++){
    //     vectors.push(this.getColumns(i))
    // }
    return new Matrix(
      ...this[0].map((_: any, i: number) => {
        return this.getColumn(i);
      })
    );
  }
  // 叉乘
  cross(m1: Matrix) {
    const arr = new Array(this.rows).fill("").map((): any => []);
    if (this.columns === m1.rows) {
      for (let i = 0; i < this.rows; i++) {
        const row = this.getRow(i);
        for (let j = 0; j < m1.columns; j++) {
          const column = m1.getColumn(j);
          arr[i][j] = row.reduce((prev: number, r: number, index: number) => {
            return prev + r * column[index];
          }, 0);
        }
      }
    }
    return new Matrix(...arr);
  }
  // 返回正常的二维坐标（降维）
  to2D() {
    return this.map((item: any) => {
      return [item[0], item[1]];
    });
  }
  toPoints() {
    return this.map((item: any) => {
      return new Point(item[0], item[1]);
    });
  }
}

export class RotateMatrix extends Matrix {
  private alpha: number;
  constructor(alpha: number) {
    super(
      new Vector(+Math.cos(alpha).toFixed(2), +Math.sin(alpha).toFixed(2), 0),
      new Vector(-Math.sin(alpha).toFixed(2), +Math.cos(alpha).toFixed(2), 0),
      new Vector(0, 0, 1)
    );
    this.alpha = alpha;
  }
  inverse() {
    return this.transpose();
  }
}

export class ScaleMatrix extends Matrix {
  private sx: number;
  private sy: number;
  constructor(sx: number, sy: number) {
    super(new Vector(sx, 0, 0), new Vector(0, sy, 0), new Vector(0, 0, 1));
    this.sx = sx;
    this.sy = sy;
  }
  inverse() {
    return new ScaleMatrix(1 / this.sx, 1 / this.sy);
  }
}

export class TranslateMatrix extends Matrix {
  private tx: number;
  private ty: number;
  constructor(tx: number, ty: number) {
    super(new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(tx, ty, 1));
    this.tx = tx;
    this.ty = ty;
  }
  inverse() {
    return new TranslateMatrix(-this.tx, -this.ty);
  }
}
