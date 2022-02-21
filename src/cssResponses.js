const fs = require('fs');

// The CSS files
const globalStyle = fs.readFileSync(`${__dirname}/../styles/style.css`);
const appStyle = fs.readFileSync(`${__dirname}/../styles/app.css`);
const aboutStyle = fs.readFileSync(`${__dirname}/../styles/about.css`);

// Writes the style into the response
const getGlobalStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(globalStyle);
  response.end();
};

// Writes the style into the response
const getAppStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(appStyle);
  response.end();
};

// Writes the style into the response
const getAboutStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(aboutStyle);
  response.end();
};

module.exports = {
  getGlobalStyle,
  getAppStyle,
  getAboutStyle
};
