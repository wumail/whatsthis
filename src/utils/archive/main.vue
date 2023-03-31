<!--  -->
<template>
  <div id="main-wrap">
    <div id="lf"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { LogicFlow } from "./draw";
import { Vector } from "./vector";
import { Point } from "./vector";
import { Matrix, RotateMatrix, ScaleMatrix, TranslateMatrix } from "./matrix";
import earcut from "earcut";

onMounted(() => {
  const draw = new LogicFlow("#lf", "100%", "100%");

  draw.drawRectangle(50, 50, [35, 35]);
  draw.drawRectangle(100, 100, [110, 110]);
  draw.drawRectangle(100, 50, [250, 250]);
  draw.drawRectangle(50, 50, [300, 35]);

  draw.drawEllipse(50, 50, [110, 110]);
  draw.drawEllipse(50, 25, [210, 210]);
  draw.drawPolygon(
    [
      [0, 0],
      [50, 0],
      [50, 50],
      [100, 50],
      [100, 100],
    ],
    [500, 10]
  );
  console.log(earcut([0, 0, 50, 0, 50, 50, 100, 50, 100, 100]));

  // draw.drawPolygon(
  //   [
  //     [50, 0],
  //     [60, 40],
  //     [100, 50],
  //     [60, 60],
  //     [50, 100],
  //     [40, 60],
  //     [0, 50],
  //     [40, 40],
  //   ],
  //   [410, 280]
  // );

  const m1 = new Matrix(
    [50, 0, 1],
    [60, 40, 1],
    [100, 50, 1],
    [60, 60, 1],
    [50, 100, 1],
    [40, 60, 1],
    [0, 50, 1],
    [40, 40, 1]
  );

  const bc = draw.getBarycentricCoordinates(draw.drawPolygon(m1.to2D()));
  const rM3 = new RotateMatrix(Math.PI / 4);
  const tM3 = new TranslateMatrix(-bc[0], -bc[1]);
  const sM2 = new ScaleMatrix(2, 2);
  const tM4 = new TranslateMatrix(210, 210);
  draw.drawPolygon(m1.cross(tM3).cross(sM2).cross(rM3).cross(tM4).to2D());
  draw.drawPolygon(m1.cross(tM3).cross(sM2).cross(tM4).to2D()).stroke("red");
  // 折线、多边形 变换
  const tM1 = new TranslateMatrix(500, 100);
  const tM2 = new TranslateMatrix(650, 100);
  const rM1 = new RotateMatrix(Math.PI / 4);
  const sM1 = new ScaleMatrix(2, 2);
  const res1 = m1.cross(rM1).cross(tM1);
  const res2 = m1.cross(rM1).cross(tM2);
  //   const res3 = m1.cross(sM1).cross(rM1).cross(tM1);
  // const tmp1 = draw.drawPolyline(res1.to2D());
  draw.drawPolyline(m1.cross(tM1).to2D());
  // //   const bbox1 = tmp1.bbox();
  // //   draw
  // //     .drawPolygon([
  // //       [bbox1.x, bbox1.y],
  // //       [bbox1.x, bbox1.y2],
  // //       [bbox1.x2, bbox1.y2],
  // //       [bbox1.x2, bbox1.y],
  // //     ])
  // //     .attr({
  // //       stroke: "#ccc",
  // //       "stroke-dasharray": 4,
  // //     });

  // const tmp2 = draw.drawPolygon(res2.to2D());
  // draw.drawPolygon(m1.cross(tM2).to2D());
  // //   console.log(tmp2);
  // //   const bbox2 = tmp2.bbox();
  // //   draw.drawPolygon([
  // //     [bbox2.x, bbox2.y],
  // //     [bbox2.x, bbox2.y2],
  // //     [bbox2.x2, bbox2.y2],
  // //     [bbox2.x2, bbox2.y],
  // //   ]);

  // //   draw.drawPolygon(res3.to2D());

  draw.drawPolyline(
    [
      [50, 0],
      [60, 40],
      [100, 50],
      [60, 60],
      [50, 100],
      [40, 60],
      [0, 50],
      [40, 40],
    ],
    [300, 280]
  );

  const pt1 = new Point(0, 0);
  const pt2 = new Point(210, 210);
  draw.drawStraightLine(pt1, pt2);
});
</script>
<style>
#main-wrap,
#lf {
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
