const fs = require('fs');

// The client HTML page
const index = fs.readFileSync(`${__dirname}/../client/client.html`);

// Writes the client page into the response
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

module.exports = {
  getIndex,
};
