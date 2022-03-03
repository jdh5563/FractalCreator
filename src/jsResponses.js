const fs = require('fs');

// The JS files
const js = fs.readFileSync(`${__dirname}/../client/app.js`);
const app = fs.readFileSync(`${__dirname}/../client/colorselect.js`);
const post = fs.readFileSync(`${__dirname}/../client/post.js`);
const community = fs.readFileSync(`${__dirname}/../client/community.js`);
const firebase = fs.readFileSync(`${__dirname}/../client/firebase.js`);
const utils = fs.readFileSync(`${__dirname}/../client/utilities.js`);
const navbar = fs.readFileSync(`${__dirname}/../client/navbar.js`);
const userpost = fs.readFileSync(`${__dirname}/../client/userpost.js`);

// Writes the javascript into the response
const getApp = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(js);
  response.end();
};

const getPost = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(post);
  response.end();
};

const getCommunity = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(community);
  response.end();
};

const getFirebase = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(firebase);
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

const getUserPost = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(userpost);
  response.end();
};

module.exports = {
  getApp,
  getPost,
  getCommunity,
  getFirebase,
  getColorSelect,
  getUtils,
  getNavBar,
  getUserPost,
};
