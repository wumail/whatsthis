class NodeBase {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.G = 0;
    this.H = 0;
    this.isProcessed = false;
  }
  get F() {
    return this.G + this.H;
  }
  setProcessed() {
    this.isProcessed = true;
  }
  setConnection(connection) {
    this.connection = connection;
  }
  setG(g) {
    this.G = g;
  }
  setH(h) {
    this.H = h;
  }
  getManhattanDistanceTo(point) {
    const { x: x1, y: y1 } = this;
    const { x: x2, y: y2 } = point;
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}

function expandBBox(bbox, offset) {
  const { minX, minY, maxX, maxY } = bbox;
  return {
    minX: minX - offset,
    minY: minY - offset,
    maxX: maxX + offset,
    maxY: maxY + offset,
  };
}

function getPointsFromBBoxBorder(bbox) {
  const { minX, minY, maxX, maxY } = bbox;
  return [
    { x: minX, y: minY },
    {
      x: minX + (maxX - minX) / 2,
      y: minY,
    },
    { x: maxX, y: minY },
    {
      x: maxX,
      y: minY + (maxY - minY) / 2,
    },
    { x: maxX, y: maxY },
    {
      x: minX + (maxX - minX) / 2,
      y: maxY,
    },
    { x: minX, y: maxY },
    {
      x: minX,
      y: minY + (maxY - minY) / 2,
    },
  ];
}

function getHull(points) {
  const xs = points.map((item) => item.x);
  const ys = points.map((item) => item.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function hullToBorder(hull, bbox) {
  const { minX, minY, maxX, maxY } = bbox;
  const { minX: hx1, minY: hy1, maxX: hx2, maxY: hy2 } = hull;

  return [
    {
      x: hx1,
      y: minY,
    },
    {
      x: hx1,
      y: maxY,
    },
    {
      x: hx1 + (hx2 - hx1) / 2,
      y: minY,
    },
    {
      x: hx1 + (hx2 - hx1) / 2,
      y: maxY,
    },
    {
      x: hx2,
      y: minY,
    },
    {
      x: hx2,
      y: maxY,
    },
    {
      x: minX,
      y: hy1,
    },
    {
      x: maxX,
      y: hy1,
    },
    {
      x: minX,
      y: hy1 + (hy2 - hy1) / 2,
    },
    {
      x: maxX,
      y: hy1 + (hy2 - hy1) / 2,
    },
    {
      x: minX,
      y: hy2,
    },
    {
      x: maxX,
      y: hy2,
    },
  ];
}

function isBBoxContainThePoint(bbox, p) {
  const { x, y } = p;
  const { minX, minY, maxX, maxY } = bbox;
  // ignore the point on the border
  return x > minX && x < maxX && y > minY && y < maxY;
}

function filterPointsByBBox(points, bboxes) {
  const res = [];
  for (const point of points) {
    let flag = false;
    for (const bbox of bboxes) {
      if (isBBoxContainThePoint(bbox, point)) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      res.push(new NodeBase(point.x, point.y));
    }
  }
  return res;
}

function isSegmentsIntersected(seg1, seg2) {
  const [p0, p1] = seg1;
  const [p2, p3] = seg2;
  const s1x = p1.x - p0.x;
  const s1y = p1.y - p0.y;
  const s2x = p3.x - p2.x;
  const s2y = p3.y - p2.y;

  const s =
    (-s1y * (p0.x - p2.x) + s1x * (p0.y - p2.y)) / (-s2x * s1y + s1x * s2y);
  const t =
    (s2x * (p0.y - p2.y) - s2y * (p0.x - p2.x)) / (-s2x * s1y + s1x * s2y);

  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

function getVerticesFromBBox(bbox) {
  const { minX, minY, maxX, maxY } = bbox;
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
}

function isBBoxOverlap(bbox1, bbox2) {
  const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = bbox1;
  const { minX: x3, minY: y3, maxX: x4, maxY: y4 } = bbox2;
  const center1 = {
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2,
  };
  const center2 = {
    x: x3 + (x4 - x3) / 2,
    y: y3 + (y4 - y3) / 2,
  };
  return (
    Math.abs(center1.x - center2.x) * 2 <
      Math.abs(x1 - x2) + Math.abs(x3 - x4) &&
    Math.abs(center1.y - center2.y) * 2 < Math.abs(y1 - y2) + Math.abs(y3 - y4)
  );
}

function isSegmentCrossingBBox(line, bbox) {
  const [p1, p2] = line;
  if (bbox.width === 0 && bbox.height === 0) {
    return false;
  }
  const [pa, pb, pc, pd] = getVerticesFromBBox(bbox);
  let count = 0;
  if (isSegmentsIntersected([p1, p2], [pa, pb])) {
    count++;
  }
  if (isSegmentsIntersected([p1, p2], [pa, pd])) {
    count++;
  }
  if (isSegmentsIntersected([p1, p2], [pb, pc])) {
    count++;
  }
  if (isSegmentsIntersected([p1, p2], [pc, pd])) {
    count++;
  }
  return count > 1;
}

function findNeighbors(node, nodes, bboxes) {
  const neighborsSet = new Set();
  const neighbors = [];
  nodes.forEach((item) => {
    if ((item.x === node.x || item.y === node.y) && item !== node) {
      let flag = 0;
      for (const bbox of bboxes) {
        if (
          isSegmentCrossingBBox(
            [
              { x: node.x, y: node.y },
              { x: item.x, y: item.y },
            ],
            bbox
          )
        ) {
          flag--;
          break;
        }
        flag++;
      }
      flag === 2 &&
        `${item.x}/${item.y}` !== `${node.x}/${node.y}` &&
        neighborsSet.add(item);
    }
  });

  for (const point of neighborsSet) {
    neighbors.push(point);
  }

  return neighbors;
}

function findPath(startNode, endNode, points, bboxes) {
  let toSearch = [startNode];
  while (toSearch.length) {
    let current = toSearch[0];

    for (const item of toSearch) {
      if (item.F < current.F || (item.F === current.F && item.H < current.H)) {
        current = item;
      }
    }

    if (`${current.x}/${current.y}` === `${endNode.x}/${endNode.y}`) {
      const res = [{ x: current.x, y: current.y }];
      while (current.connection) {
        const { connection } = current;
        res.push({
          x: connection.x,
          y: connection.y,
        });
        current = current.connection;
      }
      return res;
    }

    current.setProcessed(true);
    toSearch = toSearch.filter((item) => item !== current);

    const neighbors = findNeighbors(current, points, bboxes).filter(
      (item) => !item.isProcessed
    );
    for (const neighbor of neighbors) {
      if (neighbor.isProcessed) continue;
      const inSearch = toSearch.includes(current);
      const costToNeighbor =
        current.G + current.getManhattanDistanceTo(neighbor);

      if (!inSearch || costToNeighbor < neighbor.G) {
        neighbor.setG(costToNeighbor);
        neighbor.setConnection(current);

        if (!inSearch) {
          neighbor.setH(neighbor.getManhattanDistanceTo(endNode));
          toSearch.push(neighbor);
        }
      }
    }
  }
  return null;
}

function getPositionOnExpandedBorder({ bbox }, node, offset) {
  const { minX, minY, maxX, maxY } = bbox;
  const { x, y } = node;
  if (x === minX) {
    return {
      x: x - offset,
      y,
    };
  }
  if (x === maxX) {
    return {
      x: x + offset,
      y,
    };
  }
  if (y === minY) {
    return {
      x,
      y: y - offset,
    };
  }
  if (y === maxY) {
    return {
      x,
      y: y + offset,
    };
  }
}

function douglasPeuckerSimplify(points, threshold) {
  if (points.length <= 2) {
    return points;
  }

  let dmax = 0;
  let index = 0;

  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  // 计算距离起点和终点最远的点
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], startPoint, endPoint);

    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  // 如果最远点的距离小于等于阈值，直接返回起点和终点
  if (dmax <= threshold) {
    return [startPoint, endPoint];
  }

  // 否则递归地简化左侧和右侧的点集
  const leftPoints = douglasPeuckerSimplify(
    points.slice(0, index + 1),
    threshold
  );
  const rightPoints = douglasPeuckerSimplify(points.slice(index), threshold);

  // 合并左侧和右侧的简化结果
  return leftPoints.slice(0, leftPoints.length - 1).concat(rightPoints);
}

// function perpendicularDistance(point, start, end) {
//   const { x: startX, y: startY } = start;
//   const { x: endX, y: endY } = end;
//   const { x, y } = point;

//   const numerator = Math.abs(
//     (endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX
//   );
//   const denominator = Math.sqrt((endY - startY) ** 2 + (endX - startX) ** 2);

//   return numerator / denominator;
// }

function perpendicularDistance(point, lineStart, lineEnd) {
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;
  const { x, y } = point;

  if (x1 === x2) {
    // 线段是垂直的
    return Math.abs(x - x1);
  }

  if (y1 === y2) {
    // 线段是水平的
    return Math.abs(y - y1);
  }

  // 计算点到线段垂直点的坐标
  let px =
    x1 +
    ((x2 - x1) * ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1))) /
      ((x2 - x1) ** 2 + (y2 - y1) ** 2);
  let py =
    y1 +
    ((y2 - y1) * ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1))) /
      ((x2 - x1) ** 2 + (y2 - y1) ** 2);

  // 计算曼哈顿距离
  return Math.abs(x - px) + Math.abs(y - py);
}

function perpendicularToStraight(line) {
  // Step 1: Convert perpendicular segments to straight lines
  const straightLine = [line[0]];
  for (let i = 0; i < line.length - 2; i++) {
    const point1 = line[i];
    const point2 = line[i + 1];
    const point3 = line[i + 2];

    if (
      isVertical(point1, point2, point3) ||
      isHorizontal(point1, point2, point3)
    ) {
      // Remove point2 to make it a straight line
      continue;
    }

    straightLine.push(point2);
  }
  straightLine.push(line[line.length - 1]);

  // Step 2: Douglas-Peucker algorithm to remove redundant points
  const epsilon = 1.0; // Adjust epsilon based on your requirements
  return douglasPeucker(straightLine, epsilon);
}

function isVertical(p1, p2, p3) {
  return p1.x === p2.x && p2.x === p3.x;
}

function isHorizontal(p1, p2, p3) {
  return p1.y === p2.y && p2.y === p3.y;
}

function douglasPeucker(points, epsilon) {
  let dmax = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    );
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon);
    const right = douglasPeucker(points.slice(index), epsilon);

    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function addExtraPointsToStraightenLine(line, maxDistance) {
  const newLine = [line[0]];

  for (let i = 0; i < line.length - 1; i++) {
    const currentPoint = line[i];
    const nextPoint = line[i + 1];

    newLine.push(currentPoint);

    const deltaX = nextPoint.x - currentPoint.x;
    const deltaY = nextPoint.y - currentPoint.y;
    const distance = Math.abs(deltaX) + Math.abs(deltaY);

    if (distance > maxDistance) {
      const numExtraPoints = Math.ceil(distance / maxDistance) - 1;
      const stepX = deltaX / (numExtraPoints + 1);
      const stepY = deltaY / (numExtraPoints + 1);

      for (let j = 0; j < numExtraPoints; j++) {
        const newX = currentPoint.x + stepX * (j + 1);
        const newY = currentPoint.y + stepY * (j + 1);
        newLine.push({ x: newX, y: newY });
      }
    }
  }

  newLine.push(line[line.length - 1]);

  return newLine;
}

function getPointsByConstantFunction(points) {
  const xSet = new Set();
  const ySet = new Set();
  points.forEach((point) => {
    const { x, y } = point;
    xSet.add(x);
    ySet.add(y);
  });
  const xArray = Array.from(xSet);
  const yArray = Array.from(ySet);
  const newPoints = [];
  for (const x of xArray) {
    for (const y of yArray) {
      newPoints.push({ x, y });
    }
  }
  return newPoints;
}

function getPointsByConstantFunctionFromBBoxes(bboxes) {
  const ySet = new Set();
  const xSet = new Set();
  bboxes.forEach((bbox) => {
    const { minX, minY, maxX, maxY } = bbox;
    const halfX = minX + (maxX - minX) / 2;
    const halfY = minY + (maxY - minY) / 2;
    ySet.add(halfY);
    xSet.add(halfX);
    xSet.add(minX);
    xSet.add(maxX);
    ySet.add(minY);
    ySet.add(maxY);
  });
  const yArray = Array.from(ySet);
  const xArray = Array.from(xSet);
  const points = [];
  for (const x of xArray) {
    for (const y of yArray) {
      points.push({ x, y });
    }
  }
  return points;
}

export function ManhattanLayout(
  startAnchor,
  endAnchor,
  startNode,
  endNode,
  offset
) {
  const startBBox = expandBBox(startNode.bbox, offset);
  const endBBox = expandBBox(endNode.bbox, offset);
  const { minX: x1, minY: y1, maxX: x2, maxY: y2 } = startBBox;
  const { minX: x3, minY: y3, maxX: x4, maxY: y4 } = endBBox;

  const midBox = getHull([
    {
      x: x1 + (x2 - x1) / 2,
      y: y1 + (y2 - y1) / 2,
    },
    {
      x: x3 + (x4 - x3) / 2,
      y: y3 + (y4 - y3) / 2,
    },
  ]);
  const expandBBoxes = [startBBox, endBBox];
  const bboxes = [startNode.bbox, endNode.bbox];

  const points1 = getPointsFromBBoxBorder(startBBox);
  const points2 = getPointsFromBBoxBorder(endBBox);
  const overlap = isBBoxOverlap(startBBox, endBBox);
  const pointsSet = new Set();
  if (overlap) {
    const outerBBox = getHull([...points1, ...points2]);
    const points3 = getPointsFromBBoxBorder(outerBBox);
    const points4 = hullToBorder(startNode.bbox, outerBBox);
    const points5 = hullToBorder(endNode.bbox, outerBBox);
    [...points1, ...points2, ...points3, ...points4, ...points5].forEach(
      (item) => {
        pointsSet.add(`${item.x}/${item.y}`);
      }
    );
  } else {
    const { minX, minY, maxX, maxY } = midBox;
    const points3 = [
      ...getPointsFromBBoxBorder(midBox),
      {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2,
      },
    ];
    const points4 = hullToBorder(midBox, getHull([...points1, ...points2]));
    const points5 = hullToBorder(startBBox, getHull([...points1, ...points2]));
    const points6 = hullToBorder(endBBox, getHull([...points1, ...points2]));
    [
      ...points1,
      ...points2,
      ...points3,
      ...points4,
      ...points5,
      ...points6,
    ].forEach((item) => {
      pointsSet.add(`${item.x}/${item.y}`);
    });
    // const points3 = getPointsByConstantFunctionFromBBoxes([
    //   ...bboxes,
    //   startBBox,
    //   endBBox,
    //   midBox,
    // ]);
    // [
    //   ...points1,
    //   ...points2,
    //   ...points3,
    //   //   ...points4,
    //   //   ...points5,
    //   //   ...points6,
    // ].forEach((item) => {
    //   pointsSet.add(`${item.x}/${item.y}`);
    // });
  }

  const tmp = [];
  pointsSet.forEach((item) => {
    const [x, y] = item.split("/");
    tmp.push(new NodeBase(+x, +y));
  });
  const points = filterPointsByBBox(tmp, expandBBoxes);

  const pos1 = getPositionOnExpandedBorder(startNode, startAnchor, offset);
  const pos2 = getPositionOnExpandedBorder(endNode, endAnchor, offset);

  const path = findPath(
    new NodeBase(pos1.x, pos1.y),
    new NodeBase(pos2.x, pos2.y),
    points,
    bboxes
  );

  const pointsTmp = perpendicularToStraight([
    startAnchor,
    ...path.reverse(),
    endAnchor,
  ]);
  const abc = filterPointsByBBox(
    getPointsByConstantFunction(pointsTmp),
    expandBBoxes
  );

  const res = findPath(
    new NodeBase(pos1.x, pos1.y),
    new NodeBase(pos2.x, pos2.y),
    abc,
    [
      {
        minX: 1,
        minY: 2,
        maxX: 1,
        maxY: 2,
      },
    ]
  );
  console.log(res);

  if (path) {
    return [
      points,
      //   douglasPeuckerSimplify([startAnchor, ...path.reverse(), endAnchor], 2),
      //   addExtraPointsToStraightenLine(
      pointsTmp,
      // 100
      //   ),
    ];
  }
  return [points, [startAnchor, endAnchor]];
}

// const offset = 20;

// const startNode = {
//   bbox: {
//     minX: 100,
//     minY: 100,
//     maxX: 200,
//     maxY: 200,
//   },
// };
// const endNode = {
//   bbox: {
//     minX: 350,
//     minY: 300,
//     maxX: 450,
//     maxY: 400,
//   },
// };
// const startAnchor = {
//   x: (startNode.bbox.maxX + startNode.bbox.minX) / 2,
//   y: startNode.bbox.maxY,
// };
// const endAnchor = {
//   x: (endNode.bbox.minX + endNode.bbox.maxX) / 2,
//   y: endNode.bbox.minY,
// };

// console.log(
//   ManhattanLayout(startAnchor, endAnchor, startNode, endNode, offset)
// );
