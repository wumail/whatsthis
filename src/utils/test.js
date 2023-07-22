function getRow(matrix, index) {
  return matrix[index];
}

function getColumn(matrix, index) {
  return [
    ...matrix.map((row) => {
      return row[index];
    }),
  ];
}

function cross(m1, m2) {
  const arr = new Array(m1.length).fill("").map(() => []);
  if (m1[0].length === m2.length) {
    for (let i = 0; i < m1.length; i++) {
      const row = getRow(m1, i);
      for (let j = 0; j < m2[0].length; j++) {
        const column = getColumn(m2, j);
        arr[i][j] = row.reduce((prev, r, index) => {
          return prev + r * column[index];
        }, 0);
      }
    }
  }
  return arr;
}

function dot(v1, v2) {
  return v2.reduce((prev, cur, index) => prev + cur * v1[index]);
}

function Point(x, y) {
  return [x, y, 1];
}

function Vector(x, y) {
  return [x, y, 0];
}

// 这里解释一下为什么两个点相加得到的是两个点的中点
// 是因为我们定义了点的列向量是[x,y,1]，假设p1：[x1,y1,1],p2：[x2,y2,1]
// 两个点相加之后结果：[x1+x2,y1+y2,2]，z变成2了，这不符合我们对点的定义
// 所以x,y,z要同时除以2，即[(x1+x2)/2, (y1+y2)/2, 1]
Point.add = function (p1, p2) {
  return Point((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
};

function Rotate(matrix, angle) {
  const rotateMatrix = [
    [Math.cos(angle), Math.sin(angle), 0],
    [-Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1],
  ];
  return cross(matrix, rotateMatrix);
}

function Scale(matrix, sx, sy) {
  const scaleMatrix = [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ];
  return cross(matrix, scaleMatrix);
}

function translate(matrix, tx, ty) {
  const translateMatrix = [
    [0, 0, tx],
    [0, 0, ty],
    [0, 0, 1],
  ];
  return cross(matrix, translateMatrix);
}

const K = 0.55228;
function generateEllipsePath(longAxis, shortAxis, center) {
  const lA = longAxis / 2,
    sA = shortAxis / 2;
  // 切线的dx dy
  const cpX = lA * K,
    cpY = sA * K;

  const part1 = [Point(-lA, 0), Point(-lA, cpY), Point(-cpX, sA), Point(0, sA)];
  const part2 = [Point(cpX, sA), Point(lA, cpY), Point(lA, 0)];
  const part3 = [Point(lA, -cpY), Point(cpX, -sA), Point(0, -sA)];
  const part4 = [Point(-cpX, -sA), Point(-lA, -cpY), Point(-lA, 0)];
  const points = part1.concat(part2, part3, part4);
  // 将原点为圆心的椭圆移动到center的位置，使其圆心为center
  const coords = translate(points, center[0], center[1]);
  const M = coords[0];
  const C = coords.slice(1);
  return {
    path: `M ${M[0]} ${M[1]} ${C.reduce((prev, cur, index) => {
      if (index % 3 === 0) {
        return prev + `C ${cur[0]} ${cur[1]} `;
      } else if (index % 3 === 1) {
        return prev + `${cur[0]} ${cur[1]} `;
      } else {
        return prev + `${cur[0]} ${cur[1]}`;
      }
    }, "")} Z`,
    points: coords,
  };
}

function generatePolygonPath(points) {
  const M = points[0];
  const L = points.slice(1);
  return {
    path: `M ${M[0]} ${M[1]} ${L.reduce((prev, cur, index) => {
      if (index % 2 === 0) {
        return prev + `L ${cur[0]} ${cur[1]} `;
      } else {
        return prev + `${cur[0]} ${cur[1]}`;
      }
    }, "")} Z`,
    points,
  };
}

function generateRectanglePath(width, height, center) {
  const w = width / 2,
    h = height / 2;
  const points = [Point(-w, h), Point(w, h), Point(w, -h), Point(-w, -h)];
  return generatePolygonPath(translate(points, center[0], center[1]));
}

const Nodes = new Map();
let count = 0;
function bbox(points) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  points.forEach((coord) => {
    minX = Math.min(minX, coord[0]);
    maxX = Math.max(maxX, coord[0]);
    minY = Math.min(minY, coord[1]);
    maxY = Math.max(maxY, coord[1]);
  });
  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function anchors(obj) {
  const { minX, maxX, minY, maxY } = obj;
  const p = [
    Point(minX, minY),
    Point(minX, maxY),
    Point(maxX, maxY),
    Point(maxX, minY),
  ];

  return {
    "#1": Point.add(p[0], p[1]),
    "#2": Point.add(p[1], p[2]),
    "#3": Point.add(p[2], p[3]),
    "#4": Point.add(p[3], p[1]),
  };
}

function generateNodes(type, ...args) {
  let path;
  switch (type) {
    case "ellipse": {
      const [longAixs, shortAxis, center] = args;
      path = generateEllipsePath(longAixs, shortAxis, center);
      break;
    }
    case "rectangle": {
      const [width, height, center] = args;
      path = generateRectanglePath(width, height, center);
      break;
    }
    case "polygon": {
      const [points] = args;
      path = generatePolygonPath(points);
      break;
    }
    default:
      break;
  }
  const box = bbox(path.points);
  return {
    ...path,
    ...box,
    ...anchors(box),
  };
}

function createNode(type, ...args) {
  const detail = generateNodes(type, ...args);
  Nodes.set(`node-${count++}`, detail);
}

const normal = Vector(1, 0); // x轴正方向
// 为了使三角形有一个对的朝向，我们需要知道三角形的偏转角度
function normalize(v) {
  // 向量归一化
  const len = Math.hypot(v[0], v[1]);
  return Vector(v[0] / len, v[1] / len);
}
function angle(v1, v2) {
  const negative = v1[0] * v2[1] - v1[1] * v2[0]; // 右手定则，判断v2在v1的左边还是右边
  const r = Math.acos(dot(normalize(v1), normalize(v2)));
  return negative >= 0 ? r : -r;
}
function generateTriangle(theta, end) {
  const w = 10;
  const h = 8;
  const points = [Point(0, 0), Point(-w, h / 2), Point(-w, -h / 2)];
  const r = translate(rotate(points, theta), end[0], end[y]);
  const [p1, p2, p3] = r;
  return `M${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`;
}
function generateStraightLinePath(start, end) {
  // 我们希望节点发生位移时，起点和终点能跟着变动，所以我们让start和end是包含节点ID和锚点ID的对象，每次都通过ID去拿到最新的锚点坐标
  const { nodeId: startNode, anchorId: startAnchor } = start;
  const { nodeId: endNode, anchorId: endAnchor } = end;
  const s = Nodes.get(startNode).anchors[startAnchor];
  const e = Nodes.get(endNode).anchors[endAnchor];
  const r = angle(normal, Vector(e[0] - s[0], e[1] - s[1]));
  const marker = generateTriangle(r, e);
  return {
    path: `M ${s[0]} ${s[1]} L ${e[0]} ${e[1]}`,
    marker,
  };
}
