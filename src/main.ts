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
    return this._width / devicePixelRatio;
  }
  public get width() {
    return this._width;
  }
  public set width(value: number) {
    this._width = value * devicePixelRatio;
  }

  private _height!: number;
  public get absHeight() {
    return this._height / devicePixelRatio;
  }
  public get height() {
    return this._height;
  }
  public set height(value: number) {
    this._height = value * devicePixelRatio;
  }

  private _zoomFactor!: number;
  public get absZoomFactor() {
    return this._zoomFactor / devicePixelRatio;
  }
  public get zoomFactor() {
    return this._zoomFactor;
  }
  public set zoomFactor(value: number) {
    this._zoomFactor = value * devicePixelRatio;
  }

  private _x!: number;
  public get absX() {
    return this._x / devicePixelRatio;
  }
  public get x() {
    return this._x;
  }
  public set x(value: number) {
    this._x = Math.max(this._minX, Math.min(this._maxX, value * devicePixelRatio));
  }

  private _y!: number;
  public get absY() {
    return this._y / devicePixelRatio;
  }
  public get y() {
    return this._y;
  }
  public set y(value: number) {
    this._y = Math.max(this._minY, Math.min(this._maxY, value * devicePixelRatio));
  }

  private _minX: number = -Infinity;
  public get absMinX() {
    return this._minX / devicePixelRatio;
  }
  public get minX() {
    return this._minX;
  }
  public set minX(value: number) {
    this._minX = value * devicePixelRatio;
  }

  private _maxX: number = Infinity;
  public get absMaxX() {
    return this._maxX / devicePixelRatio;
  }
  public get maxX() {
    return this._maxX;
  }
  public set maxX(value: number) {
    this._maxX = value * devicePixelRatio;
  }

  private _minY: number = -Infinity;
  public get absMinY() {
    return this._minY / devicePixelRatio;
  }
  public get minY() {
    return this._minY;
  }
  public set minY(value: number) {
    this._minY = value * devicePixelRatio;
  }

  private _maxY: number = Infinity;
  public get absMaxY() {
    return this._maxY / devicePixelRatio;
  }
  public get maxY() {
    return this._maxY;
  }
  public set maxY(value: number) {
    this._maxY = value * devicePixelRatio;
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
  zoomFactor: 1,
  x: 0,
  y: 0,
  minX: -100,
  maxX: 100,
  minY: -120,
  maxY: 120,
  lock: false,
  axis: true,
  grid: {
    x: [],
    y: []
  }
});

interface ViewportItemObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: string;
}

class ViewportItem implements ViewportItemObject {
  private _x!: number;
  public get absX(): number {
    return this._x / devicePixelRatio;
  }
  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value * devicePixelRatio;
  }
  
  private _y!: number;
  public get absY(): number {
    return this._y / devicePixelRatio;
  }
  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value * devicePixelRatio;
  }

  private _width!: number;
  public get absWidth(): number {
    return this._width / devicePixelRatio;
  }
  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value * devicePixelRatio;
  }

  private _height!: number;
  public get absHeight(): number {
    return this._height / devicePixelRatio;
  }
  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value * devicePixelRatio;
  }

  color!: string;
  type!: string;

  constructor(initProps: ViewportItemObject) {
    Object.assign(this, initProps);
  }
}

class ViewportCanvasRenderer {
  viewport: Viewport;
  items: ViewportItem[] = [];
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
    this.items.push(...items.map(item => new ViewportItem(item)));
    this.render();
  }

  drawAxis(ctx = this.ctx) {
    if (this.viewport.axis) {
      const { width, height, x, y } = this.viewport;
      this.ctx.beginPath();
      this.ctx.moveTo(0, height - y);
      this.ctx.lineTo(0, -height - y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(-width - x, 0);
      this.ctx.lineTo(width - x, 0);
      this.ctx.stroke();
    }
  }

  drawItem(item: ViewportItem, ctx = this.ctx) {
    // 아이템이 뷰포트에 보여야 렌더링되는 로직 추가

    switch (item.type) {
    case 'rect':
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x, item.y, item.width, item.height);
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
  console.log(viewportCanvasRenderer);
  document.body.append(viewportCanvasRenderer.canvas);
  
  viewportCanvasRenderer.addItem(
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
  );

  let isDrag = false;
  let dx = 0, dy = 0;
  document.addEventListener('pointerdown', ({ pageX, pageY }) => {
    isDrag = true;
    dx = viewport.absX;
    dy = viewport.absY;
  });
  document.addEventListener('pointermove', ({ movementX, movementY }) => {
    if (!isDrag) return;
    dx += movementX;
    dy += movementY;
    viewport.x = dx;
    viewport.y = dy;
    viewportCanvasRenderer.render();
  });
  document.addEventListener('pointerup', ({}) => {
    isDrag = false;
  });

  const reset = document.createElement('button');
  document.body.append(reset);
  reset.textContent = 'Reset';
  reset.addEventListener('click', () => {
    viewport.x = viewport.y = 0;
    viewportCanvasRenderer.render();
  });
}
main();