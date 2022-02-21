const http = require('http');
const url = require('url');
// const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const cssHandler = require('./cssResponses.js');
const jsHandler = require('./jsResponses.js');
const jsonHandler = require('./jsonResponses.js');
const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Calls different functions depending on what was requested
const urlStruct = {
  '/': htmlHandler.getIndex,
  '/about.html': htmlHandler.getIndex,
  '/app.html': htmlHandler.getApp,
  '/community.html': htmlHandler.getCommunity,
  '/images/favicon.png': imageHandler.getFavicon,
  '/images/my-name.png': imageHandler.getMyName,
  '/images/sierpinski-spraypaint.png': imageHandler.getSierpinskiSpray,
  '/images/sierpinski-triangle.png': imageHandler.getSierpinskiCrazy,
  '/images/snowflake-pentagon.png': imageHandler.getSnowflakeSpray,
  '/styles/style.css': cssHandler.getGlobalStyle,
  '/styles/app.css': cssHandler.getAppStyle,
  '/styles/about.css': cssHandler.getAboutStyle,
  '/src/app.js': jsHandler.getApp,
  '/src/colorselect.js': jsHandler.getColorSelect,
  '/src/utilities.js': jsHandler.getUtils,
  '/src/navbar.js': jsHandler.getNavBar,
  '/fractalinfo.json': jsonHandler.getFractalInfo,
  notFound: jsonHandler.notFound,
};

// Handles requests from the server
const onRequest = (request, response) => {
  // Parse the url from the request
  const parsedURL = url.parse(request.url);

  const func = urlStruct[parsedURL.pathname] || urlStruct.notFound;
  func(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
