import { Point } from "../geometry/vector";
// import earcut from "earcut";

const SAMPLING_FREQUENCY = 6;

function sampling(program: Function) {
  const points = [];
  for (let i = 0; i < SAMPLING_FREQUENCY; i++) {
    points.push(program(i / (SAMPLING_FREQUENCY - 1)));
  }
  return points;
}

// TODO: 对Arc圆弧进行采样

// 采样三次贝塞尔曲线上的点
export function sampleCubic(p1: Point, cp1: Point, cp2: Point, p2: Point) {
  const program = (t: number) => {
    if (t < 0 || t > 1) {
      throw new RangeError('The value range of parameter "t" is [0,1]');
    }
    return new Point(
      p1.x * Math.pow(1 - t, 3) +
        3 * cp1.x * t * Math.pow(1 - t, 2) +
        3 * cp2.x * Math.pow(t, 2) * (1 - t) +
        p2.x * Math.pow(t, 3),
      p1.y * Math.pow(1 - t, 3) +
        3 * cp1.y * t * Math.pow(1 - t, 2) +
        3 * cp2.y * Math.pow(t, 2) * (1 - t) +
        p2.y * Math.pow(t, 3)
    );
  };

  return sampling(program);
}

// 采样二次贝塞尔曲线上的点
export function sampleQuadratic(p1: Point, cp1: Point, p2: Point) {
  const program = (t: number) => {
    if (t < 0 || t > 1) {
      throw new RangeError('The value range of parameter "t" is [0,1]');
    }
    return new Point(
      Math.pow(1 - t, 2) * p1.x +
        2 * t * (1 - t) * cp1.x +
        Math.pow(t, 2) * p2.x,
      Math.pow(1 - t, 2) * p1.y +
        2 * t * (1 - t) * cp1.y +
        Math.pow(t, 2) * p2.y
    );
  };

  return sampling(program);
}

// 采样直线上的点
export function sampleLine(p1: Point, p2: Point) {
  const program = (t: number) => {
    if (t < 0 || t > 1) {
      throw new RangeError('The value range of parameter "t" is [0,1]');
    }
    return new Point(p1.x + (p2.x - p1.x) * t, p1.y + (p2.y - p1.y) * t);
  };

  return sampling(program);
}

// 采样适配
export function sampleAdapter(type: string, ...args: any) {
  switch (type) {
    case "L": {
      const [p1, p2] = args;
      return sampleLine(p1, p2);
    }
    case "T":
    case "Q": {
      const [p1, cp1, p2] = args;
      return sampleQuadratic(p1, cp1, p2);
    }
    case "C":
    case "S": {
      const [p1, cp1, cp2, p2] = args;
      return sampleCubic(p1, cp1, cp2, p2);
    }
    default:
      return [];
  }
}

// 解析Path中的指令，M L Q C S 认为图形都由直线、曲线组成
export function commandExplain(path: string) {
  const coordArr = path
    .split(/[a-zA-z]/)
    .filter((i) => i !== "")
    .map((item) => item)
    .filter((item) => item !== " " && item !== "");
  const rs: any = [];
  const cmdArr = path.match(/[a-yA-Y]/g) || [];
  for (let i = 0; i < coordArr.length; i++) {
    const tmp: string[] = coordArr[i].split(" ");
    rs[i] = [];
    for (let j = 0; j < tmp.length; ) {
      rs[i].push(new Point(+tmp[j++], +tmp[j++]));
    }
  }
  const cmd = [];
  for (let i = 0; i < rs.length; i++) {
    const command = cmdArr[i];
    let coords;
    switch (command) {
      case "M": {
        coords = rs[i];
        break;
      }
      case "L":
      case "Q":
      case "C": {
        const prev: any = cmd[i - 1].coords;
        const p = prev[prev.length - 1];
        coords = [p, ...rs[i]];
        break;
      }
      case "T": {
        const { coords: prevCoords, command: prevCommand }: any = cmd[i - 1];
        if (prevCommand === "Q" || prevCommand === "T") {
          const [cp, p] = prevCoords.slice(prevCoords.length - 2);
          coords = [p, cp, ...rs[i]];
        } else {
          const p = prevCoords[prevCoords.length - 1];
          coords = [p, ...rs[i]];
        }
        break;
      }
      case "S": {
        const { coords: prevCoords, command: prevCommand }: any = cmd[i - 1];
        if (prevCommand === "S" || prevCommand === "C") {
          const [cp, p] = prevCoords.slice(prevCoords.length - 2);
          coords = [p, cp, ...rs[i]];
        } else {
          const p = prevCoords[prevCoords.length - 1];
          coords = [p, ...rs[i]];
        }
        break;
      }
      default:
        break;
    }
    cmd[i] = {
      command: cmdArr[i],
      coords,
    };
  }
  let result: any = [];
  cmd.forEach((item) => {
    const { command, coords } = item;
    result = result.concat(sampleAdapter(command, ...coords));
  });
  return result;
}

// export function triangulation(points: Point[]) {
//   const pt2d: number[] = [];
//   points.forEach((p) => pt2d.push(p.x, p.y));
//   const tr = earcut(pt2d);
//   const triangles = [];
//   for (let i = 0; i < tr.length; ) {
//     triangles.push([points[tr[i++]], points[tr[i++]], points[tr[i++]]]);
//   }
//   return triangles;
// }
