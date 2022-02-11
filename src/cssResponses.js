const fs = require('fs');

// The CSS file
const style = fs.readFileSync(`${__dirname}/../styles/style.css`);

// Writes the style into the response
const getStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(style);
  response.end();
};

module.exports = {
  getStyle,
};
