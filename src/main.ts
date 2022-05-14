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
  public get width() {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
  }

  private _height!: number;
  public get height() {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
  }

  private _zoomFactor!: number;
  public get zoomFactor() {
    return this._zoomFactor;
  }
  public set zoomFactor(value: number) {
    this._zoomFactor = value;
  }

  private _x!: number;
  public get x() {
    return this._x;
  }
  public set x(value: number) {
    this._x = Math.max(this._minX, Math.min(this._maxX, value));
  }

  private _y!: number;
  public get y() {
    return this._y;
  }
  public set y(value: number) {
    this._y = Math.max(this._minY, Math.min(this._maxY, value));;
  }

  private _minX: number = -Infinity;
  public get minX() {
    return this._minX;
  }
  public set minX(value: number) {
    this._minX = value;
  }

  private _maxX: number = Infinity;
  public get maxX() {
    return this._maxX;
  }
  public set maxX(value: number) {
    this._maxX = value;
  }

  private _minY: number = -Infinity;
  public get minY() {
    return this._minY;
  }
  public set minY(value: number) {
    this._minY = value;
  }

  private _maxY: number = Infinity;
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

interface ViewportItem {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: string;
}

class ViewportCanvasRenderer {
  viewport: Viewport;
  items: ViewportItem[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
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

  addItem(...items: ViewportItem[]) {
    this.items.push(...items);
    this.render();
  }

  drawAxis(ctx = this.ctx) {
    if (this.viewport.axis) {
      const { width, height, x, y } = this.viewport;
      this.ctx.beginPath();
      this.ctx.moveTo(0, (height - y) * devicePixelRatio);
      this.ctx.lineTo(0, (-height - y) * devicePixelRatio);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo((-width - x) * devicePixelRatio, 0);
      this.ctx.lineTo((width - x) * devicePixelRatio, 0);
      this.ctx.stroke();
    }
  }

  drawItem(item: ViewportItem, ctx = this.ctx) {
    // 아이템이 뷰포트에 보여야 렌더링되는 로직 추가

    switch (item.type) {
    case 'rect':
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x * devicePixelRatio, item.y * devicePixelRatio, item.width * devicePixelRatio, item.height * devicePixelRatio);
    }
  }

  renderWithoutRaf(ctx = this.ctx) {
    const { width, height, x, y } = this.viewport;
    ctx.clearRect(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    ctx.save();
    ctx.translate((width / 2 + x) * devicePixelRatio, (height / 2 + y) * devicePixelRatio);

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
    dx = viewport.x;
    dy = viewport.y;
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