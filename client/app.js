import { firebaseInstance } from './firebase.js';
import { lerpVector, loadFile } from './utilities.js';

//#region Fields
let fractalInfo;

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

// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
window.addEventListener('beforeunload', async function (e) {
  // the absence of a returnValue property on the event will guarantee the browser unload happens
  const response = await fetch('/savePost', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: `src=${patternCanvas.toDataURL()}`,
  });

  delete e['returnValue'];
});

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
document.querySelector('#reset-button').onclick = () => init(fractalInfo);
document.querySelector('#reset-control-button').onclick = () => resetControlPoints(fractalInfo);
document.querySelector('#erase-pattern-button').onclick = () => {
  patternCtx.save();
  patternCtx.fillStyle = 'black';
  patternCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  patternCtx.restore();
  previousVertices = [];
};

document.querySelector('#post-button').addEventListener('click', async e => {
  // Create a POST request with the canvas screenshot in the body
  const tryAddPost = await fetch('/addPost', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: `src=${patternCanvas.toDataURL()}&hasUserCode=${firebaseInstance.getUserCode()}`,
  });

  if(tryAddPost.status !== 400) location.href = '/post.html';
  else{
    const notification = document.querySelector('nav-bar').shadowRoot.querySelector('#code-notification');
    const errorJSON = await tryAddPost.json();
            
    notification.classList.add("is-danger");
    notification.classList.remove("is-hidden");
    notification.innerHTML = `<b>${errorJSON.message}<b>`;
  }
});

let previousVertices = [];
let points;
let centerPoint = { x: canvasWidth / 2, y: canvasHeight / 2 };
let tracePointOriginal;
let tracePoint;
let jumpDistance;
let jumpsPerFrame;
let dotSize;

let callback;

let isPaused = false;
let animationRequestID;

let isControlHidden = false;

let centerIsVertex = false;
let midpointsAreVertices = false;

const distanceText = document.querySelector('#distance-text');
const distanceRange = document.querySelector('#distance-range');

distanceText.value = distanceRange.value / 100;
distanceText.oninput = (e) => distanceRange.value = e.target.value * 100;
distanceRange.oninput = (e) => distanceText.value = e.target.value / 100;
distanceText.onchange = (e) => jumpDistance = 1 / e.target.value;
distanceRange.onchange = () => jumpDistance = 1 / distanceText.value;

const fractalOptionalRules = document.querySelector('#fractal-optional-rules').children;

fractalOptionalRules[0].firstElementChild.addEventListener('change', () => {
  if(centerIsVertex){
    centerIsVertex = false;
    points.pop();
    resetColorList();

    // Redraw the control points without the midpoints
    controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawControlPoints();
  }
  else{
    centerIsVertex = true;
    points.push(centerPoint);
    resetColorList();
  }
});

fractalOptionalRules[1].firstElementChild.addEventListener('change', () => {
  if(midpointsAreVertices){
    midpointsAreVertices = false;
    for(let j = 1; j < points.length; j++){
      points.splice(j, 1);
    }

    resetColorList();

    // Redraw the control points without the midpoints
    controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawControlPoints();
  }
  else{
    midpointsAreVertices = true;
    const center = centerIsVertex ? points.pop() : null;
    for(let j = 1; j < points.length + 1; j += 2){
      points.splice(j, 0, { x: (points[j - 1].x + points[j % points.length].x) / 2, y: (points[j - 1].y + points[j % points.length].y) / 2 });
    }

    if(center) points.push(center);

    resetColorList();
  }
});

const fractalSelect = document.querySelector('#fractal-select');
fractalSelect.onchange = () => init(fractalInfo);

const speedSelect = document.querySelector('#speed-select');
speedSelect.onchange = () => jumpsPerFrame = speedSelect.value;

const sizeSelect = document.querySelector('#size-select');
sizeSelect.onchange = () => dotSize = sizeSelect.value;

const numSideSelect = document.querySelector('#side-num-select');
numSideSelect.onchange = () => {
  fractalSelect.value = 'Custom Fractal';

  init(fractalInfo);
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
//#endregion

//#region Initialization / Reseting
function init(json) {
  // Clear the points array
  points = [];
  previousVertices = [];
  tracePointOriginal = { x: Math.random() * (controlCanvas.width - 10), y: Math.random() * (controlCanvas.height - 10) };
  tracePoint = { x: tracePointOriginal.x, y: tracePointOriginal.y };

  dotSize = sizeSelect.value;

  fractalInfo = json;

  resetControlPoints(json);
  resetColorList();

  distanceText.value = 1 / jumpDistance;
  distanceRange.value = distanceText.value * 100;

  patternCtx.save();
  patternCtx.fillStyle = 'black';
  patternCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  patternCtx.restore();

  drawSavedCanvas();

  document.querySelector('#pause-button').textContent = 'Begin Drawing';

  if (!isPaused) {
    isPaused = true;
  }

  cancelAnimationFrame(animationRequestID);
  fractalFunctions[fractalSelect.value]();
}

function resetControlPoints(json) {
  // Initialize the points array depending on the selected fractal
  let shape;
  let fractal;
  let pointOffsets;
  
  jumpsPerFrame = speedSelect.value;

  if (fractalSelect.value !== 'Custom Fractal') {
    shape = fractalSelect.value.split(' ');
    fractal = json[shape[shape.length - 1]];
    pointOffsets = fractal.pointOffsets;
    jumpDistance = fractal.jumpDistance;

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
  else {
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

    if(centerIsVertex){
      points.push(centerPoint);
    }

    if(midpointsAreVertices){
      const center = centerIsVertex ? points.pop() : null;
      for(let j = 1; j < points.length + 1; j += 2){
        points.splice(j, 0, { x: (points[j - 1].x + points[j % points.length].x) / 2, y: (points[j - 1].y + points[j % points.length].y) / 2 });
      }

      if(center) points.push(center);
    }

    jumpDistance = 1 / distanceText.value;
  }

  // Clear the canvas
  controlCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  calculatePolygonCentroid();
  drawControlPoints();
}

function resetColorList(){
  colorSelects.replaceChildren();
  for (let i = 0; i < points.length; i++) {
    if (i % 6 == 0) {
      const div = document.createElement('div');
      div.classList.add('column', 'py-0');
      colorSelects.appendChild(div);
    }
    colorSelects.children[colorSelects.children.length - 1].appendChild(document.createElement('color-select'));
  }
}
//#endregion

//#region Drawing things
function draw(randomVertex) {
  if (!isPaused) {
    tracePoint = lerpVector(tracePoint, points[randomVertex], 1 / jumpDistance);

    patternCtx.save();
    patternCtx.globalAlpha = 0.1 * dotSize;
    patternCtx.fillStyle = colorSelects
      .children[Math.floor(randomVertex / 6)]
      .children[randomVertex % 6]
      .shadowRoot.querySelector('select').value;

    patternCtx.beginPath();
    patternCtx.translate(tracePoint.x, tracePoint.y);
    patternCtx.arc(0, 0, dotSize, 0, 360);
    patternCtx.fill();
    patternCtx.closePath();
    patternCtx.restore();
  }

  if (!isControlHidden) drawControlPoints();
}

async function drawSavedCanvas(){
  const response = await fetch('/getPost');
  const responseJSON = await response.json();

  if(responseJSON.src){
    const canvasSrc = responseJSON.src;

    const canvasImage = new Image();
    canvasImage.onload = () => { 
      if(canvasSrc) patternCtx.drawImage(canvasImage, 0, 0);
    };
    canvasImage.src = canvasSrc;
  }
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
  controlCtx.strokeStyle = 'white';
  if(centerIsVertex){
    controlCtx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    for(let i = 0; i < points.length - 1; i++){
      controlCtx.lineTo(points[i].x, points[i].y);
      controlCtx.moveTo(centerPoint.x, centerPoint.y);
      controlCtx.lineTo(points[i].x, points[i].y);
    }
  }
  else{
    controlCtx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    for (const point of points) {
      controlCtx.lineTo(point.x, point.y);
    }
  }
  controlCtx.stroke();
  controlCtx.restore();
  controlCtx.closePath();

  // Draw the centroid
  controlCtx.beginPath();
  controlCtx.save();
  controlCtx.translate(centerPoint.x, centerPoint.y);
  controlCtx.fillStyle = 'white';
  controlCtx.arc(0, 0, 5, 0, 360);
  controlCtx.fill();
  controlCtx.restore();
  controlCtx.closePath();
}
//#endregion

//#region Configuring control points
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
//#endregion

//#region Helper Functions
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

function checkNeighbors(randomVertex, distance){
  const rightNeighbor = (randomVertex - distance) % points.length;
  const leftNeighbor = (randomVertex + distance) % points.length;

  if(previousVertices[0] == leftNeighbor || previousVertices[0] == rightNeighbor){
    return false;
  }

  return true;
}
//#endregion

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

  // TODO: Add functionality for all optional rules
  let canDraw = true;
  let randomVertex;
  let rightNeighbor;
  let leftNeighbor;

  // TODO: This needs to be optimized A LOT
  for (let i = 0; i < jumpsPerFrame; i++) {
    randomVertex = Math.floor(Math.random() * points.length);

    for(let i = 2; i < fractalOptionalRules.length; i++){
      const checkbox = fractalOptionalRules[i].firstElementChild;
      if(checkbox.checked){
        switch(checkbox.id){
          case "no-same-twice":
            if(randomVertex == previousVertices[0]){
              canDraw = false;
            }
            break;
          case "same-twice-no-one":
            if(previousVertices[0] != previousVertices[1]) break;
          case "no-distance-one":
            const center = centerIsVertex ? points.pop() : null;
            canDraw = checkNeighbors(randomVertex, 1);

            if(center){
              if(previousVertices[0] === points.length - 1){
                canDraw = false;
              }

              points.push(center);
            }
            break;
          case "same-twice-no-two":
            if(previousVertices[0] != previousVertices[1]) break;
          case "no-distance-two":
            if(numSideSelect.value !== '3' || midpointsAreVertices){
              const center = centerIsVertex ? points.pop() : null;

              if(center){
                rightNeighbor = (randomVertex - 1) % points.length;
                leftNeighbor = (randomVertex + 1) % points.length;

                if(previousVertices[0] !== points.length - 1 && previousVertices[0] !== leftNeighbor && previousVertices[0] !== rightNeighbor){
                  canDraw = false;
                }

                points.push(center);
              }
              else{
                canDraw = checkNeighbors(randomVertex, 2);
              }
            }
            break;
          case "same-twice-no-three":
            if(previousVertices[0] != previousVertices[1]) break;
          case "no-distance-three":
            if(!centerIsVertex && (numSideSelect.value === '5' || midpointsAreVertices)){
              canDraw = checkNeighbors(randomVertex, 3);
            }
            break;
        }
      }
    }

    if(canDraw){
      draw(randomVertex);

      previousVertices.unshift(randomVertex);

      if (previousVertices.length == 3) {
        previousVertices.pop();
      }
    }
  }
}
// #endregion

loadFile('fractalinfo.json', init);