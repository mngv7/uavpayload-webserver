const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '0.0.0.0'; // to accept connections from outside localhost
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/') { // Serve the home page, for example use '/about' to serve the about page

    const filePath = path.join(__dirname, 'home.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error loading page');
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
