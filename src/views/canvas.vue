<!--  -->
<template>
  <div>
    <canvas id="canvas" width="1424" height="506"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import PluginCanvas from "../utils/core/plugin/plugin-canvas";
import { initialize } from "../utils/core/initialize";
import { Ellipse, Rectangle, StraightLine } from "../utils/core/shapes";
onMounted(() => {
  const pluginCanvas = new PluginCanvas("#canvas");
  initialize(pluginCanvas);
  const n1 = new Ellipse(200, 200);
  n1.translate(200, 200);
  const n2 = new Ellipse(200, 200);
  n2.translate(800, 200).scale(1.5);
  const n3 = new Rectangle(200, 200);
  n3.translate(1200, 200);

  /**
   * {
   *    nodes: [
   *      {
   *        type: 'ellipse' | 'rectangle' | 'polygon',
   *        longAxis?: number, // ellipse
   *        shortAxis?: number, // ellipse
   *        center: Point | number[],
   *        coords?: Point[] | number[][]
   *        transformation?: {
   *          rotate: number,
   *          sx: number,
   *          sy: number,
   *          tx: number,
   *          ty: number
   *        }
   *        brush?: {
   *          fillStyle: string,
   *          strokeStyle: string,
   *          setLineDash: number[],
   *          lineWidth: string
   *        }
   *      }
   *  ],
   *  edges: [
   *      {
   *        type: 'cubic' | 'quadratic' | 'polyline' | 'straight',
   *        startNode: string,
   *        endNode: string,
   *        startAnchor: string,
   *        endAnchor: string,
   *        coords?: {
   *
   *        }
   *        brush?: {
   *          strokeStyle: string,
   *          setLineDash: number[],
   *          lineWidth: string
   *        }
   *      }
   *  ]
   * }
   */

  const json =
    '[{"id":"edge-0","type":"straight","path":"M 300 200 L 650 200","focus":false,"startNode":"node-0","endNode":"node-1","startAnchor":{"path":"M296 200C296 202.20912 297.79088 204 300 204C302.20912 204 304 202.20912 304 200C304 197.79088 302.20912 196 300 196C297.79088 196 296 197.79088 296 200z","coord":[300,200,1],"id":"#3"},"endAnchor":{"path":"M646 200C646 202.20912 647.79088 204 650 204C652.20912 204 654 202.20912 654 200C654 197.79088 652.20912 196 650 196C647.79088 196 646 197.79088 646 200z","coord":[650,200,1],"id":"#1"}}]';
  window.edges.input(json);
  const e1 = new StraightLine(
    {
      nodeId: "node-1",
      anchorId: "#3",
    },
    {
      nodeId: "node-2",
      anchorId: "#1",
    }
  );
});
</script>
<style lang="scss" scoped></style>
