import { Viewport } from ".";
import { ViewportItemGraph, ViewportItemObject, ViewportItemShape, ViewportPointer } from "./items";
import { TypeOrFunction } from "./types";

export class ViewportCanvasRenderer {
  viewport: Viewport;
  items: ViewportItemObject[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pointer: ViewportPointer = { x: 0, y: 0, color: '' };
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

  hover(canvasX: number, canvasY: number) {
    const { width, height, x, y, zoomFactor } = this.viewport;
    // 뷰포트에 그릴 수 있는 실제 좌표, (zoom 적용되지 않은)
    const startX = - width / 2 - x;
    const endX = width / 2 - x;

    const startY = - height / 2 - y;
    const endY = height / 2 - y;

    // 줌 적용되지않은 뷰포트상 커서 실제 x좌표, 포인터 그릴때 사용
    const cursorX = startX + canvasX;

    // 캔버스위의 커서 상대좌표
    const perX = canvasX / width ;
    const perY = canvasY / height;
    // console.log(perX, perY);

    // 줌 적용된 좌표, 실제 y값 계산시 사용
    const zoomedStartX = startX / zoomFactor;
    const zoomedEndX = endX / zoomFactor;
    const zoomedStartY = startY / zoomFactor;
    const zoomedEndY = endY / zoomFactor;

    // 줌 적용된 커서 x좌표
    const zoomedCanvasX = zoomedStartX + (zoomedEndX - zoomedStartX) * perX;
    const zoomedCanvasY = (zoomedStartY + (zoomedEndY - zoomedStartY) * perY) * -1; // 수학좌표로 전환

    // console.log(zoomFactor, zoomedStartX, zoomedEndX, zoomedCanvasX, zoomedCanvasY);

    let minDist = Infinity;
    let nearestItem: ViewportItemGraph|undefined;
    let nearestY: number|undefined;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      switch (item.type) {
      case 'rect': break;
      case 'graph':
        const { f } = item;
          const value = f(zoomedCanvasX) * zoomFactor;
        // f(x좌표 / 확대비율) * 확대비율 => y좌표
        if (Math.abs(value - zoomedCanvasY) < minDist) {
          minDist = Math.abs(value - zoomedCanvasY);
          nearestItem = item;
          nearestY = value;
        }
      }
    }
    // console.log(nearestItem);
    if (nearestItem) {
      this.pointer.x = cursorX;
      this.pointer.y = nearestY as number;
      this.pointer.color = nearestItem.color;
    }
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
      for (let i = 0; i <= width; i+= 1) ctx.lineTo(startX + i, f((startX + i) / zoomFactor) * zoomFactor * -1); // 수학좌표로 전환
      ctx.stroke();
      ctx.closePath();
    }

  }

  drawPointer(ctx = this.ctx) {
    ctx.beginPath();
    ctx.arc(this.pointer.x, -this.pointer.y, 4, 0, 2 * Math.PI); // 수학좌표로 전환
    ctx.font = '16px Segoe UI'
    ctx.fillStyle = this.pointer.color;
    ctx.fillText(this.pointer.y.toFixed(4), this.pointer.x + 10, -this.pointer.y + 10); // 수학좌표로 전환
    ctx.fill();
    ctx.closePath();
  }

  renderWithoutRaf(ctx = this.ctx) {
    const { width, height, x, y } = this.viewport;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(1, 1); // should change with axis y;
    for (const item of this.items) this.drawItem(item);
    
    this.drawPointer(ctx);

    this.drawAxis(ctx);

    ctx.restore();
  }

  render(ctx = this.ctx) {
    requestAnimationFrame(() => this.renderWithoutRaf(ctx));
  }
}
