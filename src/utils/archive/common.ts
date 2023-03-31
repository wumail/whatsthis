import { K } from "./constant";
import { Matrix, RotateMatrix, ScaleMatrix, TranslateMatrix } from "./matrix";
import { Point, Vector } from "./vector";

export interface BaseShape {
  coords: Matrix;
  path: string;
}

export abstract class Base {
  constructor() {}

  abstract genShape(longAxis: number, shortAxis: number): Matrix;
  abstract genShape(coordinates: number[][] | Point[]): Matrix;
  abstract genShape(width: number, height: number): Matrix;

  // 变换，只做计算，不改变path
  abstract transform(transforms: Matrix[]): Matrix;

  abstract genPath(): string;

  // 改变path
  abstract transformPath(transforms: Matrix[]): string;

  abstract getBoundaryBox(): any;
}

export class Ellipse extends Base implements BaseShape {
  coords: any;
  path!: string;

  constructor(longAxis?: number, shortAxis?: number) {
    super();
    longAxis && shortAxis && this.genShape(longAxis, shortAxis);
  }

  genShape(longAxis: number, shortAxis: number): Matrix;
  genShape(coordinates: number[][] | Point[]): Matrix;
  genShape(
    longAxis: number | number[][] | Point[],
    shortAxis?: number
  ): Matrix {
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
    const part2 = [new Point(lA, cpY), new Point(lA, 0)];
    const part3 = [new Point(cpX, -sA), new Point(0, -sA)];
    const part4 = [new Point(-lA, -cpY), new Point(-lA, 0)];
    return (this.coords = new Matrix(...part1.concat(part2, part3, part4)));
  }

  transform(transforms: Matrix[]): Matrix {
    return transforms.reduce((prev, cur) => {
      return prev.cross(cur);
    }, this.coords);
  }

  genPath(): string {
    const { coords } = this;
    const M = coords[0];
    const C = coords.slice(1, 4);
    const S = coords.slice(4);
    return (this.path = `M ${M.join(" ")} C ${C.map((c: any) =>
      c.join(" ")
    ).join(", ")} ${(S as any).reduce(
      (prev: string, cur: any[], index: number) => {
        if (index % 2 === 0) {
          return prev + `S ${cur.join(" ")}, `;
        } else {
          return prev + `${cur.join(" ")} `;
        }
      },
      ""
    )}z`);
  }

  transformPath(transforms: Matrix[]): string {
    this.coords = this.transform(transforms);
    return this.genPath();
  }

  getBoundaryBox(): any {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.coords.forEach((coord: any) => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });

    const coords = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
    ];

    return {
      matrix: new Matrix(...coords),
      minX,
      maxX,
      minY,
      maxY,
    };
  }
}

export class Rectangle extends Base implements BaseShape {
  coords: any;
  path!: string;

  constructor(width?: number, height?: number) {
    super();
    width && height && this.genShape(width, height);
  }

  genShape(longAxis: number, shortAxis: number): Matrix;
  genShape(coordinates: number[][] | Point[]): Matrix;
  genShape(width: number | number[][] | Point[], height?: number): Matrix {
    const halfWidth = (width as number) / 2,
      halfHeight = (height as number) / 2;

    const coords = [
      [-halfWidth, halfHeight],
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
    ];
    return (this.coords = new Matrix(...coords));
  }

  transform(transforms: Matrix[]): Matrix {
    return transforms.reduce((prev, cur) => {
      return prev.cross(cur);
    }, this.coords);
  }

  genPath(): string {
    const { coords } = this;
    return (this.path = `M ${coords[0].join(" ")} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.join(" ")}`;
      })
      .join(" ")}
    z`);
  }

  transformPath(transforms: Matrix[]): string {
    this.coords = this.transform(transforms);
    return this.genPath();
  }

  getBoundaryBox(): any {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.coords.forEach((coord: any) => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });

    const coords = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
    ];

    return {
      matrix: new Matrix(...coords),
      minX,
      maxX,
      minY,
      maxY,
    };
  }
}

export class Polygon extends Base implements BaseShape {
  coords: any;
  path!: string;

  constructor(coordinates?: number[][] | Point[]) {
    super();
    coordinates && this.genShape(coordinates);
  }

  genShape(longAxis: number, shortAxis: number): Matrix;
  genShape(coordinates: number[][] | Point[]): Matrix;
  genShape(
    coordinates: number | number[][] | Point[],
    shortAxis?: number
  ): Matrix {
    return (this.coords = new Matrix(...(coordinates as number[][] | Point[])));
  }

  transform(transforms: Matrix[]): Matrix {
    return transforms.reduce((prev, cur) => {
      return prev.cross(cur);
    }, this.coords);
  }

  genPath(): string {
    const { coords } = this;
    return (this.path = `M ${coords[0].join(" ")} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.join(" ")}`;
      })
      .join(" ")}
    z`);
  }

  transformPath(transforms: Matrix[]): string {
    this.coords = this.transform(transforms);
    return this.genPath();
  }

  getBoundaryBox(): any {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.coords.forEach((coord: any) => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });

    const coords = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
    ];

    return {
      matrix: new Matrix(...coords),
      minX,
      maxX,
      minY,
      maxY,
    };
  }
}

export class Polyline extends Base implements BaseShape {
  coords: any;
  path!: string;

  constructor(coordinates?: number[][] | Point[]) {
    super();
    coordinates && this.genShape(coordinates);
  }

  genShape(longAxis: number, shortAxis: number): Matrix;
  genShape(coordinates: number[][] | Point[]): Matrix;
  genShape(coordinates: number | number[][] | Point[], none?: number): Matrix {
    return (this.coords = new Matrix(...(coordinates as number[][] | Point[])));
  }

  transform(transforms: Matrix[]): Matrix {
    return transforms.reduce((prev, cur) => {
      return prev.cross(cur);
    }, this.coords);
  }

  genPath(): string {
    const { coords } = this;
    return (this.path = `M ${coords[0].join(" ")} ${coords
      .slice(1)
      .map((coord: any) => {
        return `L ${coord.join(" ")}`;
      })
      .join(" ")}`);
  }

  transformPath(transforms: Matrix[]): string {
    this.coords = this.transform(transforms);
    return this.genPath();
  }

  // getBoundaryBox(): any {
  //   const [p1, p2] = this.coords;
  //   const test = (start: any, end: any) => {
  //     const v1 = new Vector(end, start);
  //     const len = v1.getLength();
  //     const tM = new TranslateMatrix(start[0], start[1]);
  //     const rM = new RotateMatrix(Math.PI / 2);
  //     const sM = new ScaleMatrix(2 / len, 2 / len);
  //     const rv = new Matrix(v1).cross(tM).cross(rM).cross(sM).to2D()[0];
  //     const rX = rv[0] - start[0],
  //       rY = rv[1] - start[1];
  //     const tM1 = new TranslateMatrix(rX, rY);
  //     const tM2 = new TranslateMatrix(-rX, -rY);
  //     const b1 = this.coords.cross(tM1).to2D();
  //     const b2 = this.coords.cross(tM2).to2D().reverse();
  //     const result = [b1.concat(b2)];
  //     return result;
  //   };
  //   return new Matrix(...coords);

  getBoundaryBox(): any {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.coords.forEach((coord: any) => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });

    const coords = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
    ];

    return {
      matrix: new Matrix(...coords),
      minX,
      maxX,
      minY,
      maxY,
    };
  }
}
