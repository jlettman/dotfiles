"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const ws = require("ws");
const fs = require("fs");
const path = require("path");
class Server {
    constructor(extension) {
        this.extension = extension;
        this.httpServer = http.createServer((request, response) => this.handler(request, response));
        this.httpServer.listen(0, 'localhost', undefined, (err) => {
            if (err) {
                this.extension.logger.addLogMessage(`Error creating LaTeX Workshop http server: ${err}.`);
            }
            else {
                const { address, port } = this.httpServer.address();
                this.address = `${address}:${port}`;
                this.extension.logger.addLogMessage(`Server created on ${this.address}`);
            }
        });
        this.wsServer = ws.createServer({ server: this.httpServer });
        this.wsServer.on('connection', (websocket) => {
            websocket.on('message', (msg) => this.extension.viewer.handler(websocket, msg));
            websocket.on('close', () => this.extension.viewer.handler(websocket, '{"type": "close"}'));
        });
        this.extension.logger.addLogMessage(`Creating LaTeX Workshop http and websocket server.`);
    }
    handler(request, response) {
        if (!request.url) {
            return;
        }
        request.url = decodeURIComponent(decodeURIComponent(request.url));
        if (request.url.indexOf('pdf:') >= 0 && request.url.indexOf('viewer.html') < 0) {
            // The second backslash was encoded as %2F, and the first one is prepended by request
            const fileName = request.url.replace('//pdf:', '');
            try {
                const pdfSize = fs.statSync(fileName).size;
                response.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': pdfSize });
                fs.createReadStream(fileName).pipe(response);
                this.extension.logger.addLogMessage(`Preview PDF file: ${fileName}`);
            }
            catch (e) {
                response.writeHead(404);
                response.end();
                this.extension.logger.addLogMessage(`Error reading PDF file: ${fileName}`);
            }
            return;
        }
        else {
            let root;
            if (request.url.startsWith('/build/') || request.url.startsWith('/cmaps/')) {
                root = path.resolve(`${this.extension.extensionRoot}/node_modules/pdfjs-dist`);
            }
            else {
                root = path.resolve(`${this.extension.extensionRoot}/viewer`);
            }
            const fileName = path.join(root, request.url.split('?')[0]);
            let contentType = 'text/html';
            switch (path.extname(fileName)) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                default:
                    break;
            }
            fs.readFile(fileName, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        response.writeHead(404);
                    }
                    else {
                        response.writeHead(500);
                    }
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map