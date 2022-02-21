const fs = require('fs');

const fractalInfo = fs.readFileSync(`${__dirname}/../fractalinfo.json`);

// function to send a json object
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Gets the JSON for fractal data
const getFractalInfo = (request, response) => {
  const responseJSON = JSON.parse(fractalInfo);
  respondJSON(request, response, 200, responseJSON);
};

// function to show not implemented error
const notImplemented = (request, response) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'This page has not been implemented yet. Check back later for updates!',
    id: 'notImplemented',
  };

  // return our json with a 501 error code
  return respondJSON(request, response, 501, responseJSON);
};

// function to show not found error
const notFound = (request, response) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return our json with a 404 not found error code
  return respondJSON(request, response, 404, responseJSON);
};

// exports to set functions to public.
// In this syntax, you can do getIndex:getIndex, but if they
// are the same name, you can short handle to just getIndex,
module.exports = {
  getFractalInfo,
  notImplemented,
  notFound,
};
