import { TypeOrFunction, ViewportGridLine } from "./types";

export interface ViewportGridObject {
  x: ViewportGridLine[];
  y: ViewportGridLine[];
}

export interface ViewportObject {
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

export class Viewport implements ViewportObject {
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
    return this._zoomFactor;
  }
  public set zoomFactor(value: number) {
    this._zoomFactor = Math.max(this._minZoomFactor, Math.min(this._maxZoomFactor, value));
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
