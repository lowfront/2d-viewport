import { Viewport } from ".";
import { ViewportItemGraph, ViewportItemObject, ViewportItemShape } from "./items";
import { TypeOrFunction } from "./types";

export class ViewportCanvasRenderer {
  viewport: Viewport;
  items: ViewportItemObject[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor(viewport: Viewport) {

    this.viewport = viewport;
    const canvas = this.canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    this.ctx = canvas.getContext('2d') as NonNullable<typeof this.ctx>;
    canvas.style.width = viewport.absWidth + 'px';
    canvas.style.height = viewport.absHeight + 'px';
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
    const { width, height, x, y, zoomFactor } = this.viewport;



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

    this.render(ctx);
  }

  drawAxis(ctx = this.ctx) {
    if (this.viewport.axis) {
      const { width, height, x, y } = this.viewport;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(0, height / 2 + y);
      ctx.lineTo(0, -height / 2 + y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-width / 2 - x, 0);
      ctx.lineTo(width / 2 - x, 0);
      ctx.stroke();
      ctx.closePath();
    }
  }

  drawItem(item: ViewportItemObject, ctx = this.ctx) {
    // 아이템이 뷰포트에 보여야 렌더링되는 로직 추가
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
      const { width, height, x, y } = this.viewport;
      // 확대/축소 비율을 고려하지 않고 translate만 고려한 캔버스의 왼쪽 끝, 오른쪽 끝 저장
      const startX = - width / 2 - x;
      const endX = width / 2 - x;

      ctx.beginPath();
      ctx.strokeStyle = item.color;
      // ctx.fillRect(startX, 0, 10, 10);
      // ctx.fillRect(endX - 10, 0, 10, 10);
      ctx.moveTo(startX, f(startX));
      // 왼쪽 끝에서 오른쪽 끝까지 canvas.width 크기만큼 루프하고, y값은 확대축소 비율에 따라 보정
      for (let i = 0; i <= width; i+= 1) ctx.lineTo(startX + i, f((startX + i) / zoomFactor) * zoomFactor);
      ctx.stroke();
      ctx.closePath();
    }

  }


  renderWithoutRaf(ctx = this.ctx) {
    const { width, height, x, y } = this.viewport;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(1, -1); // should change with axis y;
    for (const item of this.items) this.drawItem(item);

    this.drawAxis(ctx);

    ctx.restore();
  }

  render(ctx = this.ctx) {
    requestAnimationFrame(() => this.renderWithoutRaf(ctx));
  }
}
