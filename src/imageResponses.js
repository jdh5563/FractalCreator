const fs = require('fs');

// The favicon file
const favicon = fs.readFileSync(`${__dirname}/../images/favicon.png`);

// Writes the favicon into the response
const getFavicon = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(favicon);
  response.end();
};

module.exports = {
  getFavicon,
};
