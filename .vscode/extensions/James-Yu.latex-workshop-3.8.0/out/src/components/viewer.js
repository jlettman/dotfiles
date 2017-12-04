"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const opn = require("opn");
class Viewer {
    constructor(extension) {
        this.clients = {};
        this.positions = {};
        this.extension = extension;
    }
    refreshExistingViewer(sourceFile, type) {
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const client = this.clients[pdfFile.toLocaleUpperCase()];
        if (client !== undefined &&
            (type === undefined || client.type === type) &&
            client.ws !== undefined) {
            this.extension.logger.addLogMessage(`Refresh PDF viewer for ${pdfFile}`);
            client.ws.send(JSON.stringify({ type: 'refresh' }));
            return true;
        }
        this.extension.logger.addLogMessage(`No PDF viewer connected for ${pdfFile}`);
        return false;
    }
    checkViewer(sourceFile, type) {
        if (this.refreshExistingViewer(sourceFile, type)) {
            return;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        if (!fs.existsSync(pdfFile)) {
            this.extension.logger.addLogMessage(`Cannot find PDF file ${pdfFile}`);
            return;
        }
        if (this.extension.server.address === undefined) {
            this.extension.logger.addLogMessage(`Cannot establish server connection.`);
            return;
        }
        const url = `http://${this.extension.server.address}/viewer.html?file=/pdf:${encodeURIComponent(pdfFile)}`;
        this.extension.logger.addLogMessage(`Serving PDF file at ${url}`);
        return url;
    }
    openViewer(sourceFile) {
        const url = this.checkViewer(sourceFile, 'viewer');
        if (!url) {
            return;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const client = this.clients[pdfFile.toLocaleUpperCase()];
        if (client !== undefined && client.ws !== undefined) {
            client.ws.close();
        }
        this.clients[pdfFile.toLocaleUpperCase()] = { type: 'viewer' };
        try {
            opn(url);
            this.extension.logger.addLogMessage(`Open PDF viewer for ${pdfFile}`);
        }
        catch (e) {
            vscode.window.showInputBox({
                prompt: 'Unable to open browser. Please copy and visit this link.',
                value: url
            });
            this.extension.logger.addLogMessage(`Something bad happened when opening PDF viewer for ${pdfFile}: ${e}`);
        }
        this.extension.logger.displayStatus('repo', 'statusBar.foreground', `Open PDF viewer for ${path.basename(pdfFile)}.`);
    }
    openTab(sourceFile) {
        const url = this.checkViewer(sourceFile, 'tab');
        if (!url) {
            return;
        }
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const client = this.clients[pdfFile.toLocaleUpperCase()];
        const uri = vscode.Uri.file(pdfFile).with({ scheme: 'latex-workshop-pdf' });
        let column = vscode.ViewColumn.Two;
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn === vscode.ViewColumn.Two) {
            column = vscode.ViewColumn.Three;
        }
        if (client !== undefined && client.ws !== undefined) {
            client.ws.close();
        }
        this.clients[pdfFile.toLocaleUpperCase()] = { type: 'tab' };
        vscode.commands.executeCommand('vscode.previewHtml', uri, column, path.basename(pdfFile));
        this.extension.logger.addLogMessage(`Open PDF tab for ${pdfFile}`);
        this.extension.logger.displayStatus('repo', 'statusBar.foreground', `Open PDF tab for ${path.basename(pdfFile)}.`);
    }
    handler(ws, msg) {
        const data = JSON.parse(msg);
        let client;
        switch (data.type) {
            case 'open':
                client = this.clients[decodeURIComponent(data.path).toLocaleUpperCase()];
                if (client !== undefined) {
                    client.ws = ws;
                    if (client.type === undefined && client.prevType !== undefined) {
                        client.type = client.prevType;
                    }
                }
                break;
            case 'close':
                for (const key in this.clients) {
                    client = this.clients[key];
                    if (client !== undefined && client.ws === ws) {
                        client.prevType = client.type;
                        delete client.ws;
                        delete client.type;
                    }
                }
                break;
            case 'position':
                for (const key in this.clients) {
                    client = this.clients[key];
                    if (client !== undefined && client.ws === ws) {
                        client.position = data;
                    }
                }
                break;
            case 'loaded':
                client = this.clients[decodeURIComponent(data.path).toLocaleUpperCase()];
                if (client !== undefined && client.ws !== undefined) {
                    if (client.position !== undefined) {
                        client.ws.send(JSON.stringify(client.position));
                    }
                    else {
                        const configuration = vscode.workspace.getConfiguration('latex-workshop');
                        client.ws.send(JSON.stringify({
                            type: 'params',
                            scale: configuration.get('view.pdf.zoom'),
                            hand: configuration.get('view.pdf.hand')
                        }));
                    }
                }
                break;
            case 'click':
                this.extension.locator.locate(data, decodeURIComponent(data.path));
                break;
            default:
                this.extension.logger.addLogMessage(`Unknown websocket message: ${msg}`);
                break;
        }
    }
    syncTeX(pdfFile, record) {
        const client = this.clients[pdfFile.toLocaleUpperCase()];
        if (client === undefined) {
            this.extension.logger.addLogMessage(`PDF is not viewed: ${pdfFile}`);
            return;
        }
        if (client.ws !== undefined) {
            client.ws.send(JSON.stringify({ type: 'synctex', data: record }));
            this.extension.logger.addLogMessage(`Try to synctex ${pdfFile}`);
        }
    }
}
exports.Viewer = Viewer;
class PDFProvider {
    constructor(extension) {
        this.extension = extension;
    }
    provideTextDocumentContent(uri) {
        const url = `http://${this.extension.server.address}/viewer.html?file=/pdf:${uri.authority ? `\\\\${uri.authority}` : ''}${encodeURIComponent(uri.fsPath)}`;
        return `
            <!DOCTYPE html><html><head></head>
            <body><iframe class="preview-panel" src="${url}" style="position:absolute; border: none; left: 0; top: 0; width: 100%; height: 100%;">
            </iframe></body></html>
        `;
    }
}
exports.PDFProvider = PDFProvider;
//# sourceMappingURL=viewer.js.map