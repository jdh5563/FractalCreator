const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const cssHandler = require('./cssResponses.js');
const jsHandler = require('./jsResponses.js');
const jsonHandler = require('./jsonResponses.js');
const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/src/server.js
const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addPost') {
    parseBody(request, response, jsonHandler.addPost);
  } else if (parsedUrl.pathname === '/savePost') {
    parseBody(request, response, jsonHandler.savePost);
  }
};

// Calls different functions depending on what was requested
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/about.html': htmlHandler.getIndex,
    '/app.html': htmlHandler.getApp,
    '/post.html': htmlHandler.getPost,
    '/community.html': htmlHandler.getCommunity,
    '/images/favicon.png': imageHandler.getFavicon,
    '/images/my-name.png': imageHandler.getMyName,
    '/images/sierpinski-spraypaint.png': imageHandler.getSierpinskiSpray,
    '/images/sierpinski-triangle.png': imageHandler.getSierpinskiCrazy,
    '/images/snowflake-pentagon.png': imageHandler.getSnowflakeSpray,
    '/styles/style.css': cssHandler.getGlobalStyle,
    '/styles/app.css': cssHandler.getAppStyle,
    '/styles/about.css': cssHandler.getAboutStyle,
    '/client/app.js': jsHandler.getApp,
    '/client/post.js': jsHandler.getPost,
    '/client/community.js': jsHandler.getCommunity,
    '/client/firebase.js': jsHandler.getFirebase,
    '/client/colorselect.js': jsHandler.getColorSelect,
    '/client/utilities.js': jsHandler.getUtils,
    '/client/navbar.js': jsHandler.getNavBar,
    '/client/userpost.js': jsHandler.getUserPost,
    '/fractalinfo.json': jsonHandler.getFractalInfo,
    '/getPost': jsonHandler.getPost,

    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/fractalinfo.json': jsonHandler.getFractalInfoMeta,
    '/getPost': jsonHandler.getPostMeta,

    notFound: jsonHandler.notFoundMeta,
  },
  POST: {
    '/savePost': handlePost,
    '/addPost': handlePost,
  },
};

// Handles requests from the server
const onRequest = (request, response) => {
  // Parse the url from the request
  const parsedURL = url.parse(request.url);

  const func = urlStruct[request.method][parsedURL.pathname] || urlStruct[request.method].notFound;
  func(request, response, parsedURL);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
