'use strict';
var vscode = require('vscode');
var LuaLinter = (function () {
    function LuaLinter() {
    }
    LuaLinter.prototype.lintDocument = function (textDocument) {
        if (textDocument.languageId !== 'lua') {
            return;
        }
        console.log('Lint document: ' + textDocument.fileName);
    };
    LuaLinter.prototype.activate = function (subscriptions) {
        subscriptions.push(this);
        var linter = this;
        vscode.workspace.onDidChangeTextDocument(function (event) {
            linter.lintDocument(event.document);
        });
    };
    LuaLinter.prototype.provideCodeActions = function (document, range, context, token) {
        return [{
                title: "Accept hlint suggestion",
                command: HaskellLintingProvider.commandId,
                arguments: [document, diagnostic.range, diagnostic.message]
            }];
    };
    return LuaLinter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LuaLinter;
//# sourceMappingURL=LuaLinter.js.map