"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var initialConfigurations = [
    {
        name: "Attach",
        type: "duk",
        request: "attach",
        address: "localhost",
        port: 9091,
        localRoot: "${workspaceRoot}",
        sourceMaps: false,
        outDir: null,
        stopOnEntry: false,
        debugLog: false
    }
];
function activate(context) {
    console.log("Duk Ext Activated");
    var vscmds = vscode.commands;
    var subs = context.subscriptions;
    var extCmds = {
        "duk-debug.provideInitialConfigurations": function () { return provideInitialConfigurations(); }
    };
    for (var k in extCmds) {
        var cmd = extCmds[k];
        subs.push(vscmds.registerCommand(k, cmd));
    }
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function provideInitialConfigurations() {
    var cfgs = JSON.stringify(initialConfigurations, null, '\t')
        .split("\n").map(function (l) { return '\t' + l; }).join('\n').trim();
    return [
        "{",
        '\t"version": "0.2.0",',
        '\t"configurations": ' + cfgs,
        "}"
    ].join("\n");
}
