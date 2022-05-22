import './main.css';
import { Viewport } from './Viewport';
import { ViewportCanvasRenderer } from './Viewport/canvas-renderer';
import { ViewportItemObject } from './Viewport/items';

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

  document.addEventListener('pointermove', (ev) => {
    const { target, clientX, clientY } = ev;
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    // console.log(canvasX, canvasY);
    viewportCanvasRenderer.hover(canvasX, canvasY);
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
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    if (deltaY < 0) {
      viewportCanvasRenderer.zoom(zoomFactor => zoomFactor * 1.2, canvasX, canvasY); // send layerX, layerY
    } else {
      viewportCanvasRenderer.zoom(zoomFactor => zoomFactor * 0.7, canvasX, canvasY); // send layerX, layerY
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

const viewport = new Viewport({
  width: 400,
  height: 300,
  minZoomFactor: 0.001,
  maxZoomFactor: Infinity,
  zoomFactor: 1,
  x: 0,
  y: 0,
  // minX: -100,
  // maxX: 100,
  // minY: -120,
  // maxY: 120,
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
    f(x) { return -1/50 * x * x; },
    color: 'purple',
  },
  // {
  //   type: 'graph',
  //   f(x) { return Math.sin(Math.pow(Math.E, x / 100)) * 100; },
  //   color: 'gray',
  // },
  {
    type: 'graph',
    f(x) { return Math.sin(x / 50) * 50; },
    color: 'gray',
  },
  {
    type: 'graph',
    f(x) { return Math.pow(x / 200, 3) * 200},
    color: 'salmon',
  },
  {
    type: 'graph',
    f(x) { return Math.pow(x / 50, Math.E); },
    color: 'red',
  },
];

main();