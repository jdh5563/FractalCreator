const fs = require('fs');

// The JS file
const js = fs.readFileSync(`${__dirname}/../src/app.js`);
const app = fs.readFileSync(`${__dirname}/../src/colorselect.js`);
const utils = fs.readFileSync(`${__dirname}/../src/utilities.js`);

// Writes the javascript into the response
const getApp = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(js);
  response.end();
};

const getColorSelect = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(app);
  response.end();
};

const getUtils = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(utils);
  response.end();
};

module.exports = {
  getApp,
  getColorSelect,
  getUtils,
};
