import {
  containPoint,
  windowToLocal,
  containPointByShape,
} from "../contain/containPoint";
import { redraw } from "../schedule/schedule";

const step = 20;

export function findElement(e: any) {
  const local = windowToLocal(e);
  const searchResult = window.tree.search({
    minX: local.x,
    maxX: local.x,
    minY: local.y,
    maxY: local.y,
  });
  const values = searchResult;
  let val;
  let f = false,
    index = 0,
    res = undefined;
  while ((val = values[index++])) {
    if (!val.id.includes("edge")) {
      f = containPointByShape(local, val);
      if (f) {
        res = val;
        break;
      }
    }
  }
  return res;
}

export function eventProxy(brush: any) {
  brush.dom.addEventListener("click", (e: any) => {
    const ele = findElement(e);
    if (ele) {
      window.ele && (window.ele.focus = false);
      window.ele && (window.ele = undefined);
      ele.focus = true;
      window.ele = ele;
      window.clicked = true;
      requestAnimationFrame(redraw(brush));
    } else {
      window.ele && (window.ele.focus = false);
      window.ele && (window.ele = undefined);
      window.clicked = false;
      requestAnimationFrame(redraw(brush));
    }
  });
  brush.dom.addEventListener("mousedown", (e: any) => {
    e.stopPropagation();
    const ele = findElement(e);
    if (ele) {
      window.ele && (window.ele.focus = false);
      window.ele && (window.ele = undefined);
      window.ele = ele;
      window.isDragging = true;
      const trans = windowToLocal(e);
      const offset = [trans.x - ele.center.x, trans.y - ele.center.y];
      window.offset = offset;
    } else {
      // 框选
      window.ele && (window.ele.focus = false);
      window.ele && (window.ele = undefined);
    }
  });
  brush.dom.addEventListener(
    "mousemove",
    (e: any) => {
      const { isDragging, ele, offset } = window as any;
      if (isDragging && ele) {
        const { x, y } = windowToLocal(e);
        const timeX = Math.floor((x - offset[0]) / step);
        const timeY = Math.floor((y - offset[1]) / step);
        const offsetX = timeX * step;
        const offsetY = timeY * step;
        x && y && ele.translate(offsetX, offsetY);
      }
    },
    { passive: true }
  );
  brush.dom.addEventListener("mouseup", (e: any) => {
    !window.clicked && (window.ele = undefined);
    window.isDragging = false;
    window.offset = undefined;
  });
  brush.dom.addEventListener("dblclick", (e: any) => {
    if (window.ele) {
      const target = window.ele;
      const { center } = target;
      const app = document.querySelector("#app");
      const div = document.createElement("div");
      let str = target.text;
      target.text = "";
      requestAnimationFrame(redraw(brush));
      const width = ((target.maxX - target.minX) * 3) / 5;
      const height = (target.maxY - target.minY) / 2;

      div.contentEditable = "true";
      div.style.position = "absolute";
      div.style.zIndex = "1";
      div.style.left = `${center.x - width / 2}px`;
      div.style.top = `${center.y - height / 2}px`;
      div.style.width = width + "px";
      div.style.height = height + "px";
      div.style.border = "1px solid #ccc";
      div.style.color = "#000";
      div.style.borderRadius = "5px";
      div.style.textAlign = "center";
      div.id = "textInput";
      div.innerText = str;

      (div as any).sourceShape = window.ele;
      app?.appendChild(div);
      div.focus();
      if (div.innerText) {
        placeCaretAtEnd(div);
      }
      div.addEventListener("input", (e: any) => {
        str = e.target.innerText;
      });
      div.addEventListener("blur", () => {
        target.text = str;
        app?.removeChild(div);
        requestAnimationFrame(redraw(brush));
      });
    }
    // window.text.set("text", {
    //   text: "ohhhhhhhhhh~",
    //   x: local.x,
    //   y: local.y,
    // });
  });
}

function placeCaretAtEnd(el: any) {
  if (window.getSelection !== undefined && document.createRange !== undefined) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel!.removeAllRanges();
    sel!.addRange(range);
  }
}
