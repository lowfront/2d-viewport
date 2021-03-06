import { Viewport } from ".";
import { ViewportItemGraph, ViewportItemObject, ViewportItemShape, ViewportPointer } from "./items";
import { TypeOrFunction } from "./types";

export class ViewportCanvasRenderer {
  viewport: Viewport;
  items: ViewportItemObject[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pointer: ViewportPointer = { x: 0, y: 0, color: '', value: 0 };
  constructor(viewport: Viewport) {

    this.viewport = viewport;
    const canvas = this.canvas = document.createElement('canvas');
    canvas.width = viewport.width * devicePixelRatio;
    canvas.height = viewport.height * devicePixelRatio;
    this.ctx = canvas.getContext('2d') as NonNullable<typeof this.ctx>;
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';
    this.render();
  }

  addItem(...items: ViewportItemObject[]) {
    this.items.push(...items.map(item => {
      if (item.type === 'graph') {
        return new ViewportItemGraph(item);
      } else {
        return new ViewportItemShape(item);
      }
    }));
    this.render();
  }

  zoom(val: TypeOrFunction<number>, layerX: number, layerY: number, ctx = this.ctx) {
    const { width, height } = this.canvas;
    const { x, y, zoomFactor } = this.viewport;



    // get position in viewport by layer position
    const absX = layerX - (width / 2 + x);
    const absY = layerY - (height / 2 + y);
    
    const newZoomFactor = typeof val === 'function' ? val(zoomFactor) : val;
    const multipliedZoomFactor = newZoomFactor / zoomFactor;


    const scaledX = absX * multipliedZoomFactor;
    const scaledY = absY * multipliedZoomFactor;
    
    const willMovedX = absX - scaledX; // absX - absX * multipliedZoomFactor => absX(1 - multipliedZoomFactor)
    const willMovedY = absY - scaledY; // absY - absY * multipliedZoomFactor => absY(1 - multipliedZoomFactor)
    
    this.viewport.zoomFactor = newZoomFactor;
    // console.log(this.viewport.zoomFactor)
    if (newZoomFactor !== this.viewport.zoomFactor) return this.render(ctx); // bug... in minZoomFactor with x, y limit

    this.viewport.x += willMovedX;
    this.viewport.y += willMovedY;

    this.hover(layerX, layerY)

    this.render(ctx);
  }

  hover(canvasX: number, canvasY: number) {
    const { width, height } = this.canvas;
    const { x, y, zoomFactor } = this.viewport;
    // ???????????? ?????? ??? ?????? ?????? ??????, (zoom ???????????? ??????)
    const startX = - width / 2 - x;
    const endX = width / 2 - x;

    const startY = - height / 2 - y;
    const endY = height / 2 - y;

    // ??? ?????????????????? ???????????? ?????? ?????? x??????, ????????? ????????? ??????
    const cursorX = startX + canvasX;

    // ??????????????? ?????? ????????????
    const perX = canvasX / width;
    const perY = canvasY / height;
    // console.log(perX, perY);

    // ??? ????????? ??????, ?????? y??? ????????? ??????
    const zoomedStartX = startX / zoomFactor;
    const zoomedEndX = endX / zoomFactor;
    const zoomedStartY = startY / zoomFactor;
    const zoomedEndY = endY / zoomFactor;

    // ??? ????????? ?????? x??????
    const zoomedCanvasX = zoomedStartX + (zoomedEndX - zoomedStartX) * perX;
    const zoomedCanvasY = (zoomedStartY + (zoomedEndY - zoomedStartY) * perY) * -1; // ??????????????? ??????

    // console.log(zoomFactor, zoomedStartY, zoomedEndY, zoomedCanvasY);

    let minDist = Infinity;
    let nearestItem: ViewportItemGraph|undefined;
    let nearestY: number|undefined;
    let pointerValue: number|undefined;
    // console.log('------');
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      switch (item.type) {
      case 'rect': break;
      case 'graph':
        const { f } = item;
        const value = f(zoomedCanvasX);
        const y = value * zoomFactor;
        const dist = Math.abs(value - zoomedCanvasY);
        // f(x?????? / ????????????) * ???????????? => y??????
        // console.log(item.color, value, 'x', zoomedCanvasX, 'y', zoomedCanvasY, zoomFactor);
        if (dist < minDist) {
          minDist = dist;
          nearestItem = item;
          nearestY = y;
          pointerValue = value;
        }
      }
    }
    // console.log(nearestItem);
    if (nearestItem) {
      this.pointer.x = cursorX;
      this.pointer.y = nearestY as number;
      this.pointer.value = pointerValue as number;
      this.pointer.color = nearestItem.color;
    }
  }

  drawAxis(ctx = this.ctx) {
    if (this.viewport.axis) {
      const { width, height } = this.canvas;
      const { x, y } = this.viewport;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(0, height / 2 - y);
      ctx.lineTo(0, -height / 2 - y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-width / 2 - x, 0);
      ctx.lineTo(width / 2 - x, 0);
      ctx.stroke();
      ctx.closePath();
    }
  }

  drawItem(item: ViewportItemObject, ctx = this.ctx) {
    // ???????????? ???????????? ????????? ??????????????? ?????? ??????
    const { zoomFactor } = this.viewport;
    switch (item.type) {
    case 'rect':
      ctx.fillStyle = item.color;
      ctx.fillRect(
        item.x * zoomFactor,
        item.y * zoomFactor,
        item.width * zoomFactor,
        item.height * zoomFactor
      );
      break;
    case 'graph':
      const { f } = item;
      const { width, height } = this.canvas;
      const { x, y } = this.viewport;
      // ??????/?????? ????????? ???????????? ?????? translate??? ????????? ???????????? ?????? ???, ????????? ??? ??????
      const startX = - width / 2 - x;
      const endX = width / 2 - x;

      ctx.lineWidth = 1 * devicePixelRatio;
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      // ctx.fillRect(startX, 0, 10, 10);
      // ctx.fillRect(endX - 10, 0, 10, 10);
      ctx.moveTo(startX, f(startX));
      // ?????? ????????? ????????? ????????? canvas.width ???????????? ????????????, y?????? ???????????? ????????? ?????? ??????
      for (let i = 0; i <= width; i+= 1) ctx.lineTo(startX + i, f((startX + i) / zoomFactor) * zoomFactor * -1); // ??????????????? ??????
      ctx.stroke();
      ctx.closePath();
    }

  }

  drawPointer(ctx = this.ctx) {
    ctx.beginPath();
    ctx.arc(this.pointer.x, -this.pointer.y, 3 * devicePixelRatio, 0, 2 * Math.PI); // ??????????????? ??????
    ctx.font = `${Math.floor(12 * devicePixelRatio)}px Segoe UI`
    ctx.fillStyle = this.pointer.color;
    ctx.fillText(this.pointer.value.toFixed(4), this.pointer.x + 10, -this.pointer.y + 10); // ??????????????? ??????
    ctx.fill();
    ctx.closePath();
  }

  renderWithoutRaf(ctx = this.ctx) {
    const { width, height } = this.canvas;
    const { x, y } = this.viewport;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(1, 1); // should change with axis y;
    
    this.drawAxis(ctx);
    for (const item of this.items) this.drawItem(item);
    this.drawPointer(ctx);


    ctx.restore();
  }

  render(ctx = this.ctx) {
    requestAnimationFrame(() => this.renderWithoutRaf(ctx));
  }
}
