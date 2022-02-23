const fs = require('fs');

// The client HTML pages
const index = fs.readFileSync(`${__dirname}/../client/about.html`);
const app = fs.readFileSync(`${__dirname}/../client/app.html`);
const post = fs.readFileSync(`${__dirname}/../client/post.html`);
const community = fs.readFileSync(`${__dirname}/../client/community.html`);

// Writes the landing page into the response
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// Writes the app page into the response
const getApp = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(app);
  response.end();
};

// Writes the post page into the response
const getPost = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(post);
  response.end();
};

// Writes the community page into the response
const getCommunity = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(community);
  response.end();
};

module.exports = {
  getIndex,
  getApp,
  getPost,
  getCommunity,
};