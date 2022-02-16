function getRandomUnitVector() {
  let x = getRandom(-1, 1);
  let y = getRandom(-1, 1);
  let length = Math.sqrt(x * x + y * y);
  if (length == 0) { // very unlikely
    x = 1; // point right
    y = 0;
    length = 1;
  } else {
    x /= length;
    y /= length;
  }
  return { x, y };
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Load a given url
// Call the given callback function with the information returned from the url
const loadFile = (url, callback) => {
  const fetchPromise = async () => {
    const response = await fetch(url);
    callback(await response.json());
  };

  fetchPromise();
};

export { loadFile };