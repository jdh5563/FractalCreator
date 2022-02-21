const fs = require('fs');

// The JS file
const js = fs.readFileSync(`${__dirname}/../client/app.js`);
const app = fs.readFileSync(`${__dirname}/../client/colorselect.js`);
const utils = fs.readFileSync(`${__dirname}/../client/utilities.js`);
const navbar = fs.readFileSync(`${__dirname}/../client/navbar.js`);

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

const getNavBar = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(navbar);
  response.end();
};

module.exports = {
  getApp,
  getColorSelect,
  getUtils,
  getNavBar,
};