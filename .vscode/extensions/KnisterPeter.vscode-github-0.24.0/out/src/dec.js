"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function showProgress(target, propertyKey) {
    target[propertyKey] = function () {
        const options = {
            location: vscode.ProgressLocation.SourceControl,
            title: 'GitHub'
        };
        return vscode.window.withProgress(options, target[propertyKey]);
    };
}
exports.showProgress = showProgress;
//# sourceMappingURL=dec.js.map