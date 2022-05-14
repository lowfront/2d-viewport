import './main.css';

type Function1<T> = (value: T) => T;
type TypeOrFunction<T> = T|Function1<T>;
type ViewportGridLine = [number, string];

interface ViewportGridObject {
  x: ViewportGridLine[];
  y: ViewportGridLine[];
}

interface ViewportObject {
  width: number;
  height: number;
  minZoomFactor: number;
  maxZoomFactor: number;
  zoomFactor: number;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  lock: boolean;
  axis: boolean;
  grid: ViewportGridObject
}

class Viewport implements ViewportObject {
  private _width!: number;
  public get absWidth() {
    return this._width;
  }
  public get width() {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
  }

  private _height!: number;
  public get absHeight() {
    return this._height;
  }
  public get height() {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
  }

  private _minZoomFactor: number = 0.1
  public get minZoomFactor(): number {
    return this._minZoomFactor;
  }
  public set minZoomFactor(value: number) {
    this._minZoomFactor = value;
  }

  private _maxZoomFactor: number = Infinity
  public get maxZoomFactor(): number {
    return this._maxZoomFactor;
  }
  public set maxZoomFactor(value: number) {
    this._maxZoomFactor = value;
  }

  private _zoomFactor!: number;
  public get absZoomFactor() {
    return this._zoomFactor;
  }
  public get zoomFactor() {
    return Math.max(this._minZoomFactor, Math.min(this._maxZoomFactor, this._zoomFactor));
  }
  public set zoomFactor(value: number) {
    this._zoomFactor = value;
  }

  private _x!: number;
  public get absX() {
    return this._x;
  }
  public get x() {
    return this._x;
  }
  public set x(value: number) {
    this._x = Math.max(this._minX * this._zoomFactor, Math.min(this._maxX * this._zoomFactor, value));
  }

  private _y!: number;
  public get absY() {
    return this._y;
  }
  public get y() {
    return this._y;
  }
  public set y(value: number) {
    this._y = Math.max(this._minY * this._zoomFactor, Math.min(this._maxY * this._zoomFactor, value));
  }

  private _minX: number = -Infinity;
  public get absMinX() {
    return this._minX;
  }
  public get minX() {
    return this._minX;
  }
  public set minX(value: number) {
    this._minX = value;
  }

  private _maxX: number = Infinity;
  public get absMaxX() {
    return this._maxX;
  }
  public get maxX() {
    return this._maxX;
  }
  public set maxX(value: number) {
    this._maxX = value;
  }

  private _minY: number = -Infinity;
  public get absMinY() {
    return this._minY;
  }
  public get minY() {
    return this._minY;
  }
  public set minY(value: number) {
    this._minY = value;
  }

  private _maxY: number = Infinity;
  public get absMaxY() {
    return this._maxY;
  }
  public get maxY() {
    return this._maxY;
  }
  public set maxY(value: number) {
    this._maxY = value;
  }

  private _lock: boolean = false;
  public get lock() {
    return this._lock;
  }
  public set lock(value: boolean) {
    this._lock = value;
  }

  private _axis: boolean = false;
  public get axis() {
    return this._axis;
  }
  public set axis(value: boolean) {
    this._axis = value;
  }

  private _grid!: ViewportGridObject;
  public get grid() {
    return this._grid;
  }
  public set grid(value: ViewportGridObject) {
    this._grid = value;
  }

  constructor(initObject: ViewportObject) {
    const { minX, maxX, minY, maxY } = initObject;
    Object.assign(this, { minX, maxX, minY, maxY });
    Object.assign(this, initObject);
  }

  setLock(value: TypeOrFunction<boolean>) {
    this._lock = typeof value === 'function' ? value(this._lock) : value;
    return this;
  }
  setX(x: TypeOrFunction<number>) {
    this.x = typeof x === 'function' ? x(this.x) : x;
    return this;
  }
  setY(y: TypeOrFunction<number>) {
    this.y = typeof y === 'function' ? y(this.y) : y;
    return this;
  }
  setPosition(x: TypeOrFunction<number>, y: TypeOrFunction<number>) {
    this.x = typeof x === 'function' ? x(this.x) : x;
    this.y = typeof y === 'function' ? y(this.y) : y;
    return this;
  }
  setZoom(zoomFactor: TypeOrFunction<number>) {
    this._zoomFactor = typeof zoomFactor === 'function' ? zoomFactor(this._zoomFactor) : zoomFactor;
  }
}


const viewport = new Viewport({
  width: 400,
  height: 300,
  minZoomFactor: 0.1,
  maxZoomFactor: Infinity,
  zoomFactor: 1,
  x: 0,
  y: 0,
  minX: -100,
  maxX: 100,
  minY: -120,
  maxY: 120,
  minX: -Infinity,
  maxX: Infinity,
  minY: -Infinity,
  maxY: Infinity,
  lock: false,
  axis: true,
  grid: {
    x: [],
    y: []
  }
});

interface ViewportItemGraphObject {
  f: (x: number) => number;
  color: string;
  type: 'graph';
}
interface ViewportItemShapeObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'rect';
}
type ViewportItemObject = ViewportItemShapeObject | ViewportItemGraphObject;

class ViewportItemShape implements ViewportItemShapeObject {
  private _x!: number;
  public get absX(): number {
    return this._x;
  }
  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value;
  }
  
  private _y!: number;
  public get absY(): number {
    return this._y;
  }
  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
  }

  private _width!: number;
  public get absWidth(): number {
    return this._width;
  }
  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
  }

  private _height!: number;
  public get absHeight(): number {
    return this._height;
  }
  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
  }

  color!: string;
  type!: 'rect';

  constructor(initProps: ViewportItemObject) {
    Object.assign(this, initProps);
  }
}

class ViewportItemGraph implements ViewportItemGraphObject {
  type!: 'graph';
  f!: (x: number) => number;
  color!: string;

  constructor(initProps: ViewportItemGraphObject) {
    Object.assign(this, initProps);
  }
}

class ViewportCanvasRenderer {
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
    // if (newZoomFactor !== this.viewport.zoomFactor) return this.render(ctx); // bug... in minZoomFactor with x, y limit

    this.viewport.x += willMovedX;
    this.viewport.y += willMovedY;

    this.render(ctx);
  }

  drawAxis(ctx = this.ctx) {
    if (this.viewport.axis) {
      const { width, height, x, y } = this.viewport;
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
      ctx.fillRect(startX, 0, 10, 10);
      ctx.fillRect(endX - 10, 0, 10, 10);
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

    for (const item of this.items) this.drawItem(item);

    this.drawAxis(ctx);

    ctx.restore();
  }

  render(ctx = this.ctx) {
    requestAnimationFrame(() => this.renderWithoutRaf(ctx));
  }
}

async function main() {
  const viewportCanvasRenderer = new ViewportCanvasRenderer(viewport);
  console.log(viewportCanvasRenderer, items);
  document.body.append(viewportCanvasRenderer.canvas);
  
  viewportCanvasRenderer.addItem(...items);

  let isDrag = false;
  let dx = 0, dy = 0, tempX = 0, tempY = 0;
  document.addEventListener('pointerdown', ({ clientX, clientY }) => {
    isDrag = true;
    dx = viewport.x;
    dy = viewport.y;
    tempX = clientX;
    tempY = clientY;
  });
  document.addEventListener('pointermove', ({ target, clientX, clientY }) => {
    if (!isDrag) return;
    
    dx += clientX - tempX; // 처음에 값을 빼는 방식으로 temp와 dx 합칠 수 있음
    dy += clientY - tempY;
    
    tempX = clientX;
    tempY = clientY;

    viewport.x = dx;
    viewport.y = dy;
    viewportCanvasRenderer.render();
  });
  document.addEventListener('pointerup', ({}) => {
    isDrag = false;
  });

  document.addEventListener('wheel', ev => {
    const { ctrlKey, deltaX, deltaY, clientX, clientY } = ev;
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    // if (!ctrlKey) return;
    ev.preventDefault();
    if (deltaY < 0) {
      viewportCanvasRenderer.zoom(zoomFactor => zoomFactor + 0.1, clientX - rect.left, clientY - rect.top); // send layerX, layerY
    } else {
      viewportCanvasRenderer.zoom(zoomFactor => zoomFactor - 0.1, clientX - rect.left, clientY - rect.top); // send layerX, layerY
    }
  }, { passive: false });

  const reset = document.createElement('button');
  document.body.append(reset);
  reset.textContent = 'Reset';
  reset.addEventListener('click', () => {
    viewport.zoomFactor = 1;
    viewport.x = viewport.y = 0;
    viewportCanvasRenderer.render();
  });
}

const items: ViewportItemObject[] = [
  {
    x: 20,
    y: 20,
    width: 120,
    height: 80,
    color: 'red',
    type: 'rect',
  },
  {
    x: -150,
    y: -150,
    width: 120,
    height: 100,
    color: 'skyblue',
    type: 'rect',
  },
  {
    type: 'graph',
    f(x) { return -x + 30; },
    color: 'green',
  },
  {
    type: 'graph',
    f(x) { return 1/50 * x * x; },
    color: 'blue',
  },
  {
    type: 'graph',
    f(x) { return Math.sin(x / 50) * 50; },
    color: 'gray',
  },
];

main();