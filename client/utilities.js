// LERP function found here: https://github.com/mattdesl/lerp/blob/master/index.js
// Linear interpolation of a vector. This works like normal LERP but applies it to each component of the vector
function lerpVector (startVector, endVector, percent){
  return {
    x: startVector.x * (1 - percent) + endVector.x * percent,
    y: startVector.y * (1 - percent) + endVector.y * percent
  };

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

export { loadFile, lerpVector };