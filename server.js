const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '0.0.0.0';
const port = 3000;

function serveHTML (res, file_name) {
    const file_path = path.join(__dirname, file_name);

    fs.readFile(file_path, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end('The webServer encountered an error.');
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        } 
    });
}

const webServer = http.createServer((req, res) => {
    switch(req.url) {
        case '/':
        case '/dashboard':
            serveHTML(res, 'dashboard.html');
            break;

        case '/live-feed':
            serveHTML(res, 'live_feed.html');
            break;

        case '/logs':
            serveHTML(res, 'logs.html');
            break;

        default:
            res.statusCode = 404;
            res.end('Error 404: page not found.')
    }
});

webServer.listen(port, hostname, () => {
    console.log(`webServer running at http://${hostname}:${port}/`);
});