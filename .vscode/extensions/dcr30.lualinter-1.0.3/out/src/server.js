'use strict';
var vscode_languageserver_1 = require('vscode-languageserver');
// Create a connection for the server. The connection uses Node's IPC as a transport
var connection = vscode_languageserver_1.createConnection(process.stdin, process.stdout);
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities. 
var workspaceRoot;
connection.onInitialize(function (params) {
    connection.console.log("wat 1");
    console.log("wat 2");
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind
        }
    };
});
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map