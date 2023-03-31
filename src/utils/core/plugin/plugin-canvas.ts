export default class PluginCanvas {
  public ctx: any;
  public type: string = "canvas";
  public width: number;
  public height: number;
  public dom: any;
  constructor(target: string) {
    this.dom = document.querySelector(target);
    this.ctx = this.dom.getContext("2d");
    this.width = this.dom.width;
    this.height = this.dom.height;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  draw(edges: any, nodes: any, text: any) {
    try {
      edges.forEach((edge: any) => {
        this.ctx.save();

        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = "1";
        edge.genPath();
        const { path, marker } = edge;
        this.ctx.stroke(new Path2D(path));
        Object.keys(marker.brush).forEach((key: string) => {
          const a = this.ctx[key];
          if (a) {
            if (typeof a === "function") {
              a(marker.brush[key]);
            } else {
              this.ctx[key] = marker.brush[key];
            }
          }
        });
        this.ctx.stroke(new Path2D(marker.path));
        this.ctx.fill(new Path2D(marker.path));

        this.ctx.restore();
      });
      nodes.forEach((item: any) => {
        if (this.ctx) {
          this.ctx.save();
          this.ctx.strokeStyle = "#000";
          this.ctx.lineWidth = "2";
          this.ctx.fillStyle && (this.ctx.fillStyle = "#fff");
          this.ctx.stroke(new Path2D(item.path));
          this.ctx.restore();
          // this.ctx.fill(new Path2D(item.path));
          if (item.focus) {
            this.drawBorder(item);

            this.ctx.save();
            this.ctx.strokeStyle = "#000";
            this.ctx.lineWidth = "2";
            this.ctx.fillStyle && (this.ctx.fillStyle = "#fff");
            this.drawAnchors(item);
            this.drawVertexes(item);
            this.ctx.restore();
          }
          if (item.text) {
            this.ctx.save();
            this.ctx.font = "16px STheiti, SimHei";
            this.ctx.fillStyle = "#000";
            const maxWidth = ((item.maxX - item.minX) * 3) / 5;
            this.ctx.wrapText(
              item.text,
              item.center.x,
              item.center.y + 5,
              maxWidth
            );
            this.ctx.restore();
          }
        }
      });
      text.forEach((item: any) => {
        const { text: str, x, y } = item;
        this.ctx.save();
        this.ctx.font = "24px STheiti, SimHei";
        this.ctx.fillStyle = "#000";
        this.ctx.fillText(str, x, y);
        this.ctx.restore();
      });
    } catch (error) {
      console.log(error);
    }
  }
  drawAnchors(item: any) {
    const anchors = item.anchors;
    const keys = Object.keys(anchors);
    anchors &&
      keys &&
      keys.forEach((key: any) => {
        const el = anchors[key];
        this.ctx.stroke(new Path2D(el.path));
        this.ctx.fill(new Path2D(el.path));
      });
  }
  drawVertexes(item: any) {
    const vertexes = item.vertexes;
    const keys = Object.keys(vertexes);
    vertexes &&
      keys &&
      keys.forEach((key: any) => {
        const el = vertexes[key];
        this.ctx.stroke(new Path2D(el.path));
        this.ctx.fill(new Path2D(el.path));
      });
  }
  drawBorder(item: any) {
    this.ctx.save();
    this.ctx.setLineDash?.([4, 2]);
    this.ctx.lineWidth = "0.5";
    const borders = item.borders;
    borders &&
      borders.forEach((el: any) => {
        this.ctx.stroke(new Path2D(el.path));
      });
    this.ctx.restore();
  }
}

(CanvasRenderingContext2D.prototype as any).wrapText = function (
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number
) {
  if (
    typeof text != "string" ||
    typeof centerX != "number" ||
    typeof centerY != "number"
  ) {
    return;
  }
  let contentHeight = 0;
  let x = centerX;
  let y = centerY;
  let context = this;
  let canvas = context.canvas;
  let lineWidth = 0;

  if (typeof maxWidth == "undefined") {
    maxWidth = (canvas && canvas.width) || 300;
  }
  if (typeof lineHeight == "undefined") {
    lineHeight =
      (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) ||
      parseInt(window.getComputedStyle(document.body).lineHeight);
  }

  // 字符分隔为数组
  let arrText = text.split("");
  let line = "";

  for (let n = 0; n < arrText.length; n++) {
    let testLine = line + arrText[n];
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      line = arrText[n];
      contentHeight += lineHeight;
    } else {
      line = testLine;
    }
  }
  line = "";
  y = y - contentHeight / 2;
  for (let n = 0; n < arrText.length; n++) {
    let testLine = line + arrText[n];
    let metrics = context.measureText(testLine);
    lineWidth = metrics.width;
    if (lineWidth > maxWidth && n > 0) {
      context.fillText(line, x - lineWidth / 2 + 2, y);
      line = arrText[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x - lineWidth / 2, y);
};
