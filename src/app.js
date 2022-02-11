import { loadFile } from './utilities.js';

const canvasWidth = document.querySelector('#canvas-column').offsetWidth * 0.95;
const canvasHeight = canvasWidth * 0.75;

const controlCanvas = document.querySelector('#control-canvas');
const controlCtx = controlCanvas.getContext('2d');
controlCanvas.width = canvasWidth;
controlCanvas.height = canvasHeight;
controlCanvas.onmousedown = grabControlPoint;
controlCanvas.onmousemove = moveControlPoint;
controlCanvas.onmouseup = dropControlPoint;
let heldPoint;

const patternCanvas = document.querySelector('#pattern-canvas');
const patternCtx = patternCanvas.getContext('2d');
patternCanvas.width = canvasWidth;
patternCanvas.height = canvasHeight;

document.querySelector('#pause-button').onclick = (e) => {
  isPaused = !isPaused;

  if (isPaused) e.target.textContent = 'Resume Drawing';
  else e.target.textContent = 'Pause Drawing';
};
document.querySelector('#toggle-control-button').onclick = (e) => {
  isControlHidden = !isControlHidden;

  if (isControlHidden) {
    e.target.textContent = 'Show Control Points';
    controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  } else {
    e.target.textContent = 'Hide Control Points';
    drawControlPoints();
  }
};
document.querySelector('#reset-button').onclick = () => loadFile('fractalinfo.json', init);
document.querySelector('#reset-control-button').onclick = resetControlPoints;
document.querySelector('#erase-pattern-button').onclick = () => {
  patternCtx.save();
  patternCtx.fillStyle = 'black';
  patternCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  patternCtx.restore();
};

let points;
let centerPoint;
let tracePointOriginal;
let tracePoint;
let jumpDistance;
let jumpsPerFrame;
let dotSize;

let callback;

let isPaused = false;
let animationRequestID;

let isControlHidden = false;

const distanceText = document.querySelector('#distance-text');
const distanceRange = document.querySelector('#distance-range');

distanceText.value = distanceRange.value / 100;
distanceText.oninput = (e) => distanceRange.value = e.target.value * 100;
distanceRange.oninput = (e) => distanceText.value = e.target.value / 100;
distanceText.onchange = (e) => jumpDistance = 1 / e.target.value;
distanceRange.onchange = () => jumpDistance = 1 / distanceText.value;

const fractalSelect = document.querySelector('#fractal-select');
fractalSelect.onchange = () => loadFile('fractalinfo.json', init);

const speedSelect = document.querySelector('#speed-select');
speedSelect.onchange = () => jumpsPerFrame = speedSelect.value;

const sizeSelect = document.querySelector('#size-select');
sizeSelect.onchange = () => dotSize = sizeSelect.value;

const numSideSelect = document.querySelector('#side-num-select');
numSideSelect.onchange = () => {
  fractalSelect.value = 'Custom Fractal';

  loadFile('fractalinfo.json', init);
};

const colorSelects = document.querySelector('#color-selects');

const fractalFunctions = {
  'Sierpinski Triangle': triangleSierpinski,
  'Tic Tac Toe Square': squareTicTacToe,
  'Ninja Star Square': squareNinjaStar,
  'Leaf Square': squareWithCircles,
  'T Square': squareWithT,
  'Snowflake Pentagon': pentagonSnowflake,
  'Star Pentagon': pentagonStar,
  'Custom Fractal': customFractal,
};

function init(json) {
  // Clear the points array
  points = [];
  tracePointOriginal = { x: Math.random() * (controlCanvas.width - 10), y: Math.random() * (controlCanvas.height - 10) };
  tracePoint = { x: tracePointOriginal.x, y: tracePointOriginal.y };

  dotSize = sizeSelect.value;

  resetControlPoints(json);

  colorSelects.replaceChildren();
  for (let i = 0; i < points.length; i++) {
    if (i % 3 == 0) {
      const div = document.createElement('div');
      div.classList.add('column', 'py-0');
      colorSelects.appendChild(div);
    }
    colorSelects.children[colorSelects.children.length - 1].appendChild(document.createElement('color-select'));
  }

  distanceText.value = 1 / jumpDistance;
  distanceRange.value = distanceText.value * 100;

  patternCtx.save();
  patternCtx.fillStyle = 'black';
  patternCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  patternCtx.restore();

  document.querySelector('#pause-button').textContent = 'Begin Drawing';

  if (!isPaused) {
    isPaused = true;
  }

  cancelAnimationFrame(animationRequestID);
  fractalFunctions[fractalSelect.value]();
}

function draw(randomVertex) {
  if (!isPaused) {
    tracePoint.x = (tracePoint.x + points[randomVertex].x) / jumpDistance;
    tracePoint.y = (tracePoint.y + points[randomVertex].y) / jumpDistance;

    patternCtx.save();
    patternCtx.globalAlpha = 0.1 * dotSize;
    patternCtx.fillStyle = colorSelects
      .children[Math.floor(randomVertex / 3)]
      .children[randomVertex % 3]
      .shadowRoot.querySelector('select').value;

    patternCtx.beginPath();
    patternCtx.translate(tracePoint.x, tracePoint.y);
    patternCtx.arc(0, 0, dotSize, 0, 360);
    patternCtx.fill();
    patternCtx.closePath();
    patternCtx.restore();

    if (!isControlHidden) drawControlPoints();
  }
}

function resetControlPoints(json) {
  // Initialize the points array depending on the selected fractal
  let shape;
  let fractal;
  let pointOffsets;
  if (fractalSelect.value != 'Custom Fractal') {
    console.log(json);
    shape = fractalSelect.value.split(' ');
    fractal = json[shape[shape.length - 1]];
    pointOffsets = fractal.pointOffsets;
    jumpDistance = fractal.jumpDistance;
    jumpsPerFrame = speedSelect.value;

    switch (pointOffsets.length) {
      case 3:
        points = [
          { x: pointOffsets[0].x, y: pointOffsets[0].y },
          { x: controlCanvas.width + pointOffsets[1].x, y: pointOffsets[1].y },
          { x: controlCanvas.width * pointOffsets[2].x, y: controlCanvas.height + pointOffsets[2].y },
        ];
        break;
      case 4:
        points = [
          { x: pointOffsets[0].x, y: pointOffsets[0].y },
          { x: pointOffsets[1].x, y: controlCanvas.height + pointOffsets[1].y },
          { x: controlCanvas.width + pointOffsets[2].x, y: controlCanvas.height + pointOffsets[2].y },
          { x: controlCanvas.width + pointOffsets[3].x, y: pointOffsets[3].y },
        ];
        break;
      case 5:
        points = [
          { x: controlCanvas.width * pointOffsets[0].x, y: pointOffsets[0].y },
          { x: controlCanvas.width * pointOffsets[1].x, y: controlCanvas.height * pointOffsets[1].y },
          { x: controlCanvas.width * pointOffsets[2].x, y: controlCanvas.height + pointOffsets[2].y },
          { x: controlCanvas.width * pointOffsets[3].x, y: controlCanvas.height + pointOffsets[3].y },
          { x: controlCanvas.width * pointOffsets[4].x, y: controlCanvas.height * pointOffsets[4].y },
        ];
        break;
    }
  }

  if (fractalSelect.value === 'Custom Fractal') {
    switch (numSideSelect.value) {
      case '3':
        points = [
          { x: 10, y: 10 },
          { x: controlCanvas.width - 10, y: 10 },
          { x: controlCanvas.width / 2, y: controlCanvas.height - 10 },
        ];
        break;
      case '4':
        points = [
          { x: 10, y: 10 },
          { x: 10, y: controlCanvas.height - 10 },
          { x: controlCanvas.width - 10, y: controlCanvas.height - 10 },
          { x: controlCanvas.width - 10, y: 10 },
        ];
        break;
      case '5':
        points = [
          { x: controlCanvas.width / 2, y: 10 },
          { x: controlCanvas.width / 9, y: controlCanvas.height / 2.5 },
          { x: controlCanvas.width / 4, y: controlCanvas.height - 10 },
          { x: controlCanvas.width * 0.75, y: controlCanvas.height - 10 },
          { x: controlCanvas.width * 0.88, y: controlCanvas.height / 2.5 },
        ];
        break;
    }
    jumpDistance = 1 / distanceText.value;
  }

  // Clear the canvas
  controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  centerPoint = { x: canvasWidth / 2, y: canvasHeight / 2 };
  calculatePolygonCentroid();
  drawControlPoints();
}

function drawControlPoints() {
  // Draw each of the attractors
  for (const point of points) {
    controlCtx.save();
    controlCtx.beginPath();
    controlCtx.fillStyle = 'white';
    controlCtx.translate(point.x, point.y);
    controlCtx.arc(0, 0, 5, 0, 360);
    controlCtx.fill();
    controlCtx.closePath();
    controlCtx.restore();
  }

  // Draw lines between each attractor to outline the shape
  controlCtx.beginPath();
  controlCtx.save();
  controlCtx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
  controlCtx.strokeStyle = 'white';
  for (const point of points) {
    controlCtx.lineTo(point.x, point.y);
  }
  controlCtx.stroke();
  controlCtx.restore();
  controlCtx.closePath();

  controlCtx.beginPath();
  controlCtx.save();
  controlCtx.translate(centerPoint.x, centerPoint.y);
  controlCtx.fillStyle = 'white';
  controlCtx.arc(0, 0, 5, 0, 360);
  controlCtx.fill();
  controlCtx.restore();
  controlCtx.closePath();
}

function grabControlPoint(e) {
  if ((e.offsetX > centerPoint.x - 5 && e.offsetX < centerPoint.x + 5)
    && (e.offsetY > centerPoint.y - 5 && e.offsetY < centerPoint.y + 5)) {
    heldPoint = centerPoint;
    return;
  }

  for (const point of points) {
    if ((e.offsetX > point.x - 5 && e.offsetX < point.x + 5)
        && (e.offsetY > point.y - 5 && e.offsetY < point.y + 5)) {
      heldPoint = point;
      return;
    }
  }
}

function moveControlPoint(e) {
  if (heldPoint) {
    if (heldPoint == centerPoint) {
      for (const point of points) {
        point.x += e.movementX;
        point.y += e.movementY;
      }
    }

    // Set the new point
    heldPoint.x += e.movementX;
    heldPoint.y += e.movementY;

    // Clear the canvas
    controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    calculatePolygonCentroid();

    if (!isControlHidden) drawControlPoints();
  }
}

function dropControlPoint() {
  heldPoint = null;
}

function calculatePolygonCentroid() {
  let centroidX = 0;
  let centroidY = 0;
  for (const point of points) {
    centroidX += point.x;
    centroidY += point.y;
  }
  centerPoint.x = centroidX / points.length;
  centerPoint.y = centroidY / points.length;
}

// #region 1/2 jump fractals
function triangleSierpinski() {
  animationRequestID = requestAnimationFrame(triangleSierpinski);

  let randomVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    draw(randomVertex);
  }
}

function pentagonSnowflake() {
  animationRequestID = requestAnimationFrame(pentagonSnowflake);

  let previousVertex;
  let randomVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    if (randomVertex != previousVertex) {
      draw(randomVertex);
      previousVertex = randomVertex;
    }
  }
}

function pentagonStar() {
  animationRequestID = requestAnimationFrame(pentagonStar);

  const previousVertices = [];
  let randomVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);
    const rightNeighbor = randomVertex == 0 ? points.length - 1 : randomVertex - 1;
    const leftNeighbor = randomVertex == points.length - 1 ? 0 : randomVertex + 1;

    if ((rightNeighbor != previousVertices[0] && leftNeighbor != previousVertices[0]) || previousVertices[0] != previousVertices[1]) {
      draw(randomVertex);

      previousVertices.unshift(randomVertex);

      if (previousVertices.length == 3) {
        previousVertices.pop();
      }
    }
  }
}

function squareTicTacToe() {
  animationRequestID = requestAnimationFrame(squareTicTacToe);

  let randomVertex;
  let previousVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    if (randomVertex != previousVertex) {
      draw(randomVertex);
      previousVertex = randomVertex;
    }
  }
}

function squareNinjaStar() {
  animationRequestID = requestAnimationFrame(squareNinjaStar);

  let randomVertex;
  let previousVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    if ((randomVertex + 1) % 4 != previousVertex) {
      draw(randomVertex);
      previousVertex = randomVertex;
    }
  }
}

function squareWithCircles() {
  animationRequestID = requestAnimationFrame(squareWithCircles);

  let randomVertex;
  const previousVertices = [];
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);
    const rightNeighbor = randomVertex == 0 ? points.length - 1 : randomVertex - 1;
    const leftNeighbor = randomVertex == points.length - 1 ? 0 : randomVertex + 1;

    if ((rightNeighbor != previousVertices[0] && leftNeighbor != previousVertices[0]) || previousVertices[0] != previousVertices[1]) {
      draw(randomVertex);

      previousVertices.unshift(randomVertex);

      if (previousVertices.length == 3) {
        previousVertices.pop();
      }
    }
  }
}

function squareWithT() {
  animationRequestID = requestAnimationFrame(squareWithT);

  let randomVertex;
  let previousVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    if ((randomVertex + previousVertex) % 2 != 0 || randomVertex == previousVertex) {
      draw(randomVertex);
      previousVertex = randomVertex;
    }
  }
}
// #endregion

// #region Custom Fractals
function customFractal() {
  animationRequestID = requestAnimationFrame(customFractal);

  let randomVertex;
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    draw(randomVertex);
  }
}
// #endregion

loadFile('fractalinfo.json', init);
