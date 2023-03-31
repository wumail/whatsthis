// const REST_FRAME_TIME = 3;
const FRAME_TIME = 16.668;

export function redraw(brush: any) {
  function animation() {
    try {
      if (brush.type === "canvas") {
        brush.clear();
        brush.draw(
          window.edges.values(),
          window.nodes.values(),
          window.text.values()
        );
        window.updateQueue.clear();
      } else if (brush.type === "svg") {
        const content = window.updateQueue?.shift();
        if (content.data) {
          brush.clear(content.data);
          brush.draw(content.data);
        }
        if (window.updateQueue.virtualHead.next) {
          requestAnimationFrame(animation);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  // requestAnimationFrame(animation);
  return animation;
}
