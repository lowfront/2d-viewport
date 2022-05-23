export interface ViewportItemGraphObject {
  f: (x: number) => number;
  color: string;
  type: 'graph';
}

export interface ViewportItemShapeObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'rect';
}

export type ViewportItemObject = ViewportItemShapeObject | ViewportItemGraphObject;

export class ViewportItemShape implements ViewportItemShapeObject {
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

export class ViewportItemGraph implements ViewportItemGraphObject {
  type!: 'graph';
  f!: (x: number) => number;
  color!: string;

  constructor(initProps: ViewportItemGraphObject) {
    Object.assign(this, initProps);
    // this.f = (x: number) => initProps.f(x) * -1;
  }
}

export type ViewportPointer = {
  x: number;
  y: number;
  color: string;
  value: number;
}
