(() => {
  // src/Viewport/index.ts
  var Viewport = class {
    _width;
    get absWidth() {
      return this._width;
    }
    get width() {
      return this._width;
    }
    set width(value) {
      this._width = value;
    }
    _height;
    get absHeight() {
      return this._height;
    }
    get height() {
      return this._height;
    }
    set height(value) {
      this._height = value;
    }
    _minZoomFactor = 0.1;
    get minZoomFactor() {
      return this._minZoomFactor;
    }
    set minZoomFactor(value) {
      this._minZoomFactor = value;
    }
    _maxZoomFactor = Infinity;
    get maxZoomFactor() {
      return this._maxZoomFactor;
    }
    set maxZoomFactor(value) {
      this._maxZoomFactor = value;
    }
    _zoomFactor;
    get absZoomFactor() {
      return this._zoomFactor;
    }
    get zoomFactor() {
      return this._zoomFactor;
    }
    set zoomFactor(value) {
      this._zoomFactor = Math.max(this._minZoomFactor, Math.min(this._maxZoomFactor, value));
    }
    _x;
    get absX() {
      return this._x;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = Math.max(this._minX * this._zoomFactor, Math.min(this._maxX * this._zoomFactor, value));
    }
    _y;
    get absY() {
      return this._y;
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = Math.max(this._minY * this._zoomFactor, Math.min(this._maxY * this._zoomFactor, value));
    }
    _minX = -Infinity;
    get absMinX() {
      return this._minX;
    }
    get minX() {
      return this._minX;
    }
    set minX(value) {
      this._minX = value;
    }
    _maxX = Infinity;
    get absMaxX() {
      return this._maxX;
    }
    get maxX() {
      return this._maxX;
    }
    set maxX(value) {
      this._maxX = value;
    }
    _minY = -Infinity;
    get absMinY() {
      return this._minY;
    }
    get minY() {
      return this._minY;
    }
    set minY(value) {
      this._minY = value;
    }
    _maxY = Infinity;
    get absMaxY() {
      return this._maxY;
    }
    get maxY() {
      return this._maxY;
    }
    set maxY(value) {
      this._maxY = value;
    }
    _lock = false;
    get lock() {
      return this._lock;
    }
    set lock(value) {
      this._lock = value;
    }
    _axis = false;
    get axis() {
      return this._axis;
    }
    set axis(value) {
      this._axis = value;
    }
    _grid;
    get grid() {
      return this._grid;
    }
    set grid(value) {
      this._grid = value;
    }
    constructor(initObject) {
      const { minX, maxX, minY, maxY } = initObject;
      Object.assign(this, { minX, maxX, minY, maxY });
      Object.assign(this, initObject);
    }
    setLock(value) {
      this._lock = typeof value === "function" ? value(this._lock) : value;
      return this;
    }
    setX(x) {
      this.x = typeof x === "function" ? x(this.x) : x;
      return this;
    }
    setY(y) {
      this.y = typeof y === "function" ? y(this.y) : y;
      return this;
    }
    setPosition(x, y) {
      this.x = typeof x === "function" ? x(this.x) : x;
      this.y = typeof y === "function" ? y(this.y) : y;
      return this;
    }
    setZoom(zoomFactor) {
      this._zoomFactor = typeof zoomFactor === "function" ? zoomFactor(this._zoomFactor) : zoomFactor;
    }
  };

  // src/Viewport/items.ts
  var ViewportItemShape = class {
    _x;
    get absX() {
      return this._x;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value;
    }
    _y;
    get absY() {
      return this._y;
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value;
    }
    _width;
    get absWidth() {
      return this._width;
    }
    get width() {
      return this._width;
    }
    set width(value) {
      this._width = value;
    }
    _height;
    get absHeight() {
      return this._height;
    }
    get height() {
      return this._height;
    }
    set height(value) {
      this._height = value;
    }
    color;
    type;
    constructor(initProps) {
      Object.assign(this, initProps);
    }
  };
  var ViewportItemGraph = class {
    type;
    f;
    color;
    constructor(initProps) {
      Object.assign(this, initProps);
    }
  };

  // src/Viewport/canvas-renderer.ts
  var ViewportCanvasRenderer = class {
    viewport;
    items = [];
    canvas;
    ctx;
    pointer = { x: 0, y: 0, color: "" };
    constructor(viewport2) {
      this.viewport = viewport2;
      const canvas = this.canvas = document.createElement("canvas");
      canvas.width = viewport2.width;
      canvas.height = viewport2.height;
      this.ctx = canvas.getContext("2d");
      canvas.style.width = viewport2.absWidth + "px";
      canvas.style.height = viewport2.absHeight + "px";
      this.render();
    }
    addItem(...items2) {
      this.items.push(...items2.map((item) => {
        if (item.type === "graph") {
          return new ViewportItemGraph(item);
        } else {
          return new ViewportItemShape(item);
        }
      }));
      this.render();
    }
    zoom(val, layerX, layerY, ctx = this.ctx) {
      const { width, height, x, y, zoomFactor } = this.viewport;
      const absX = layerX - (width / 2 + x);
      const absY = layerY - (height / 2 + y);
      const newZoomFactor = typeof val === "function" ? val(zoomFactor) : val;
      const multipliedZoomFactor = newZoomFactor / zoomFactor;
      const scaledX = absX * multipliedZoomFactor;
      const scaledY = absY * multipliedZoomFactor;
      const willMovedX = absX - scaledX;
      const willMovedY = absY - scaledY;
      this.viewport.zoomFactor = newZoomFactor;
      if (newZoomFactor !== this.viewport.zoomFactor)
        return this.render(ctx);
      this.viewport.x += willMovedX;
      this.viewport.y += willMovedY;
      this.render(ctx);
    }
    hover(canvasX, canvasY) {
      const { width, height, x, y, zoomFactor } = this.viewport;
      const startX = -width / 2 - x;
      const endX = width / 2 - x;
      const startY = -height / 2 - y;
      const endY = height / 2 - y;
      const cursorX = startX + canvasX;
      const perX = canvasX / width;
      const perY = canvasY / height;
      const zoomedStartX = startX / zoomFactor;
      const zoomedEndX = endX / zoomFactor;
      const zoomedStartY = startY / zoomFactor;
      const zoomedEndY = endY / zoomFactor;
      const zoomedCanvasX = zoomedStartX + (zoomedEndX - zoomedStartX) * perX;
      const zoomedCanvasY = (zoomedStartY + (zoomedEndY - zoomedStartY) * perY) * -1;
      let minDist = Infinity;
      let nearestItem;
      let nearestY;
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        switch (item.type) {
          case "rect":
            break;
          case "graph":
            const { f } = item;
            const value = f(zoomedCanvasX) * zoomFactor;
            if (Math.abs(value - zoomedCanvasY) < minDist) {
              minDist = Math.abs(value - zoomedCanvasY);
              nearestItem = item;
              nearestY = value;
            }
        }
      }
      if (nearestItem) {
        this.pointer.x = cursorX;
        this.pointer.y = nearestY;
        this.pointer.color = nearestItem.color;
      }
    }
    drawAxis(ctx = this.ctx) {
      if (this.viewport.axis) {
        const { width, height, x, y } = this.viewport;
        ctx.strokeStyle = "black";
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
    drawItem(item, ctx = this.ctx) {
      const { zoomFactor } = this.viewport;
      switch (item.type) {
        case "rect":
          ctx.fillStyle = item.color;
          ctx.fillRect(item.x * zoomFactor, item.y * zoomFactor, item.width * zoomFactor, item.height * zoomFactor);
          break;
        case "graph":
          const { f } = item;
          const { width, height, x, y } = this.viewport;
          const startX = -width / 2 - x;
          const endX = width / 2 - x;
          ctx.beginPath();
          ctx.strokeStyle = item.color;
          ctx.moveTo(startX, f(startX));
          for (let i = 0; i <= width; i += 1)
            ctx.lineTo(startX + i, f((startX + i) / zoomFactor) * zoomFactor * -1);
          ctx.stroke();
          ctx.closePath();
      }
    }
    drawPointer(ctx = this.ctx) {
      ctx.beginPath();
      ctx.arc(this.pointer.x, -this.pointer.y, 4, 0, 2 * Math.PI);
      ctx.font = "16px Segoe UI";
      ctx.fillStyle = this.pointer.color;
      ctx.fillText(this.pointer.y.toFixed(4), this.pointer.x + 10, -this.pointer.y + 10);
      ctx.fill();
      ctx.closePath();
    }
    renderWithoutRaf(ctx = this.ctx) {
      const { width, height, x, y } = this.viewport;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + x, height / 2 + y);
      ctx.scale(1, 1);
      for (const item of this.items)
        this.drawItem(item);
      this.drawPointer(ctx);
      this.drawAxis(ctx);
      ctx.restore();
    }
    render(ctx = this.ctx) {
      requestAnimationFrame(() => this.renderWithoutRaf(ctx));
    }
  };

  // src/main.ts
  async function main() {
    const viewportCanvasRenderer = new ViewportCanvasRenderer(viewport);
    console.log(viewportCanvasRenderer, items);
    document.body.append(viewportCanvasRenderer.canvas);
    viewportCanvasRenderer.addItem(...items);
    let isDrag = false;
    let dx = 0, dy = 0, tempX = 0, tempY = 0;
    document.addEventListener("pointerdown", ({ clientX, clientY }) => {
      isDrag = true;
      dx = viewport.x;
      dy = viewport.y;
      tempX = clientX;
      tempY = clientY;
    });
    document.addEventListener("pointermove", ({ target, clientX, clientY }) => {
      if (!isDrag)
        return;
      dx += clientX - tempX;
      dy += clientY - tempY;
      tempX = clientX;
      tempY = clientY;
      viewport.x = dx;
      viewport.y = dy;
      viewportCanvasRenderer.render();
    });
    document.addEventListener("pointermove", (ev) => {
      const { target, clientX, clientY } = ev;
      const rect = ev.target.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      viewportCanvasRenderer.hover(canvasX, canvasY);
      viewportCanvasRenderer.render();
    });
    document.addEventListener("pointerup", ({}) => {
      isDrag = false;
    });
    document.addEventListener("wheel", (ev) => {
      const { ctrlKey, deltaX, deltaY, clientX, clientY } = ev;
      const rect = ev.target.getBoundingClientRect();
      ev.preventDefault();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      if (deltaY < 0) {
        viewportCanvasRenderer.zoom((zoomFactor) => zoomFactor * 1.2, canvasX, canvasY);
      } else {
        viewportCanvasRenderer.zoom((zoomFactor) => zoomFactor * 0.7, canvasX, canvasY);
      }
    }, { passive: false });
    const reset = document.createElement("button");
    document.body.append(reset);
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      viewport.zoomFactor = 1;
      viewport.x = viewport.y = 0;
      viewportCanvasRenderer.render();
    });
  }
  var viewport = new Viewport({
    width: 400,
    height: 300,
    minZoomFactor: 1e-3,
    maxZoomFactor: Infinity,
    zoomFactor: 1,
    x: 0,
    y: 0,
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
  var items = [
    {
      x: 20,
      y: 20,
      width: 120,
      height: 80,
      color: "red",
      type: "rect"
    },
    {
      x: -150,
      y: -150,
      width: 120,
      height: 100,
      color: "skyblue",
      type: "rect"
    },
    {
      type: "graph",
      f(x) {
        return -x + 30;
      },
      color: "green"
    },
    {
      type: "graph",
      f(x) {
        return 1 / 50 * x * x;
      },
      color: "blue"
    },
    {
      type: "graph",
      f(x) {
        return -1 / 50 * x * x;
      },
      color: "purple"
    },
    {
      type: "graph",
      f(x) {
        return Math.sin(x / 50) * 50;
      },
      color: "gray"
    },
    {
      type: "graph",
      f(x) {
        return Math.pow(x / 50, Math.E);
      },
      color: "red"
    }
  ];
  main();
})();
