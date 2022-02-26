const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const cssHandler = require('./cssResponses.js');
const jsHandler = require('./jsResponses.js');
const jsonHandler = require('./jsonResponses.js');
const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//Recompiles the body of a request, and then calls the
//appropriate handler once completed. Some request methods
//(like POST) send their request body in pieces or chunks. This
//is in contrast to something like a GET request, where the entire
//request always comes in as one packet. In order to use a POST
//request, we need to have the entire request body before proceeding.
//This function will reassemble the body and then handle the request.
//The "handler" parameter is the request handler function to call after
//we have the request completely reassembled.
const parseBody = (request, response, handler) => {
  
  //The request will come in in pieces. We will store those pieces in this
  //body array.
  const body = [];

  //The body reassembly process is event driven, much like when we are streaming
  //media like videos, etc. We will set up a few event handlers. This first one
  //is for if there is an error. If there is, write it to the console and send
  //back a 400-Bad Request error to the client.
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  //The second possible event is the "data" event. This gets fired when we
  //get a piece (or "chunk") of the body. Each time we do, we will put it in
  //the array. We will always recieve these chunks in the correct order.
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  //The final event is when the request is finished sending and we have recieved
  //all of the information. When the request "ends", we can proceed. Turn the body
  //array into a single entity using Buffer.concat, then turn that into a string.
  //With that string, we can use the querystring library to turn it into an object
  //stored in bodyParams. We can do this because we know that the client sends
  //us data in X-WWW-FORM-URLENCODED format. If it was in JSON we could use JSON.parse.
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    //Once we have the bodyParams object, we will call the handler function. We then
    //proceed much like we would with a GET request.
    handler(request, response, bodyParams);
  });
};

//handle POST requests
const handlePost = (request, response, parsedUrl) => {
  
  //If they go to /addUser
  if(parsedUrl.pathname === '/addPost') {
    
    //Call our below parseBody handler, and in turn pass in the
    //jsonHandler.addUser function as the handler callback function.
    parseBody(request, response, jsonHandler.addPost);
  }
};

// Calls different functions depending on what was requested
const urlStruct = {
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
  '/addPost': handlePost,

  notFound: jsonHandler.notFound,
};

// Handles requests from the server
const onRequest = (request, response) => {
  // Parse the url from the request
  const parsedURL = url.parse(request.url);

  const func = urlStruct[parsedURL.pathname] || urlStruct.notFound;
  func(request, response, parsedURL);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
