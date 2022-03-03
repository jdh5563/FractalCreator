const fs = require('fs');

const fractalInfo = fs.readFileSync(`${__dirname}/../fractalinfo.json`);

let canvasSrc;

// Function to send a json object
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Function to send a header
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// Gets fractal data
const getFractalInfo = (request, response) => {
  const responseJSON = JSON.parse(fractalInfo);
  respondJSON(request, response, 200, responseJSON);
};

const getFractalInfoMeta = (request, response) => respondJSONMeta(request, response, 200);

// Gets post data
const getPost = (request, response) => {
  if (canvasSrc) {
    return respondJSON(request, response, 200, canvasSrc);
  }

  return respondJSON(request, response, 200, { });
};

const getPostMeta = (request, response) => respondJSONMeta(request, response, 200);

// Adds post data
const addPost = (request, response, body) => {
  let status = 400;
  let responseJSON = {
    message: 'Valid user code not set!',
    id: 'userCodeParamMissing',
  };

  if (body.hasUserCode !== '0') {
    if (canvasSrc) {
      status = 204;
      responseJSON = {
        message: 'Updated Successfully',
      };

      canvasSrc = { src: body.src.split(' ').join('+') };

      return respondJSONMeta(request, response, status);
    }

    status = 201;
    responseJSON = {
      message: 'Created Successfully',
    };

    canvasSrc = { src: body.src.split(' ').join('+') };
  }

  return respondJSON(request, response, status, responseJSON);
};

// Saves post data for later
const savePost = (request, response, body) => {
  let status = 201;
  let responseJSON = {
    message: 'Created Successfully',
  };

  if (canvasSrc) {
    status = 204;
    responseJSON = {
      message: 'Updated Successfully',
    };

    canvasSrc = { src: body.src.split(' ').join('+') };

    return respondJSONMeta(request, response, status);
  }

  canvasSrc = { src: body.src.split(' ').join('+') };

  return respondJSON(request, response, status, responseJSON);
};

// Function to show not found error
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

module.exports = {
  getFractalInfo,
  getFractalInfoMeta,
  getPost,
  getPostMeta,
  addPost,
  savePost,
  notFound,
  notFoundMeta,
};
