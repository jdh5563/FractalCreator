const fs = require('fs');

// The favicon file
const favicon = fs.readFileSync(`${__dirname}/../images/favicon.png`);

const myName = fs.readFileSync(`${__dirname}/../images/my-name.png`);
const sierpinskiSpray = fs.readFileSync(`${__dirname}/../images/sierpinski-spraypaint.png`);
const sierpinskiCrazy = fs.readFileSync(`${__dirname}/../images/sierpinski-triangle.png`);
const snowflakeSpray = fs.readFileSync(`${__dirname}/../images/snowflake-pentagon.png`);

// Writes the favicon into the response
const getFavicon = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(favicon);
  response.end();
};

// Writes the images into the response
const getMyName = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(myName);
  response.end();
};

const getSierpinskiSpray = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(sierpinskiSpray);
  response.end();
};

const getSierpinskiCrazy = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(sierpinskiCrazy);
  response.end();
};

const getSnowflakeSpray = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(snowflakeSpray);
  response.end();
};

module.exports = {
  getFavicon,
  getMyName,
  getSierpinskiSpray,
  getSierpinskiCrazy,
  getSnowflakeSpray,
};
