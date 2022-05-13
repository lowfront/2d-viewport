import Hammer from 'hammerjs';
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
    this._x = value;
  }
  private _y!: number;
  public get y() {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
  }
  private _minX!: number;
  public get minX() {
    return this._minX;
  }
  public set minX(value: number) {
    this._minX = value;
  }
  private _maxX!: number;
  public get maxX() {
    return this._maxX;
  }
  public set maxX(value: number) {
    this._maxX = value;
  }
  private _minY!: number;
  public get minY() {
    return this._minY;
  }
  public set minY(value: number) {
    this._minY = value;
  }
  private _maxY!: number;
  public get maxY() {
    return this._maxY;
  }
  public set maxY(value: number) {
    this._maxY = value;
  }
  private _lock!: boolean;
  public get lock() {
    return this._lock;
  }
  public set lock(value: boolean) {
    this._lock = value;
  }
  private _axis!: boolean;
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
    Object.assign(this, initObject);
  }

  setLock(value: TypeOrFunction<boolean>) {
    this._lock = typeof value === 'function' ? value(this._lock) : value;
    return this;
  }
  setX(x: TypeOrFunction<number>) {
    this._x = typeof x === 'function' ? x(this._x) : x;
    return this;
  }
  setY(y: TypeOrFunction<number>) {
    this._y = typeof y === 'function' ? y(this._y) : y;
    return this;
  }
  setPosition(x: TypeOrFunction<number>, y: TypeOrFunction<number>) {
    this._x = typeof x === 'function' ? x(this._x) : x;
    this._y = typeof y === 'function' ? y(this._y) : y;
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
  x: 50,
  y: 50,
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

class ViewportCanvasRenderer {
  viewport: Viewport;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(viewport: Viewport) {
    this.viewport = viewport;
    const canvas = this.canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    this.ctx = canvas.getContext('2d') as NonNullable<typeof this.ctx>;
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

  render(ctx = this.ctx) {
    const { width, height, x, y } = this.viewport;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);

    this.drawAxis(ctx);

    ctx.restore();
  }
}

async function main() {
  const viewportCanvasRenderer = new ViewportCanvasRenderer(viewport);
  console.log(viewportCanvasRenderer);
  document.body.append(viewportCanvasRenderer.canvas);
  
  let isDrag = false;
  document.addEventListener('pointerdown', ({ pageX, pageY }) => {
    isDrag = true;
  });
  document.addEventListener('pointermove', ({ movementX, movementY }) => {
    if (!isDrag) return;
    viewport.x += movementX;
    viewport.y += movementY;
    viewportCanvasRenderer.render();
    console.log(viewport.x, viewport.y);
  });
  document.addEventListener('pointerup', ({}) => {
    isDrag = false;
  });
}
main();