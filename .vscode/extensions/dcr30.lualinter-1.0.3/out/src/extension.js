"use strict";
var path = require("path");
var vscode = require("vscode");
var child_process_1 = require("child_process");
var OUTPUT_REGEXP = /.+: .+:([0-9]+): (.+) near.*[<'](.*)['>]/;
var diagnosticCollection;
var currentDiagnostic;
function parseDocumentDiagnostics(document, luacOutput) {
    var matches = OUTPUT_REGEXP.exec(luacOutput);
    if (!matches) {
        return;
    }
    var message = {
        line: parseInt(matches[1]),
        text: matches[2],
        at: matches[3]
    };
    if (!message.line) {
        return;
    }
    var errorLine = document.lineAt(message.line - 1).text;
    var rangeLine = message.line - 1;
    var rangeStart = new vscode.Position(rangeLine, 0);
    var rangeEnd = new vscode.Position(rangeLine, errorLine.length);
    if (message.at !== "eof") {
        var linePosition = errorLine.indexOf(message.at);
        if (linePosition >= 0) {
            rangeStart = new vscode.Position(rangeLine, linePosition);
            rangeEnd = new vscode.Position(rangeLine, linePosition + message.at.length);
        }
    }
    var range = new vscode.Range(rangeStart, rangeEnd);
    currentDiagnostic = new vscode.Diagnostic(range, message.text, vscode.DiagnosticSeverity.Error);
}
function lintDocument(document, warnOnError) {
    if (warnOnError === void 0) { warnOnError = false; }
    var lualinterConfig = vscode.workspace.getConfiguration('lualinter');
    if (!lualinterConfig.get("enable")) {
        return;
    }
    if (document.languageId !== "lua") {
        return;
    }
    currentDiagnostic = null;
    var options = {
        cwd: path.dirname(document.fileName)
    };
    // Determine the interpreter to use
    var interpreter = lualinterConfig.get("interpreter");
    if ((interpreter !== "luac") && (interpreter !== "luajit")) {
        interpreter = "luac";
    }
    var cmd;
    if (interpreter === "luac") {
        cmd = "-p";
    }
    else {
        cmd = "-bl";
    }
    var luaProcess = child_process_1.spawn(interpreter, [cmd, "-"], options);
    luaProcess.stdout.setEncoding("utf8");
    luaProcess.stderr.on("data", function (data) {
        if (data.length == 0) {
            return;
        }
        parseDocumentDiagnostics(document, data.toString());
    });
    luaProcess.stderr.on("error", function (error) {
        vscode.window.showErrorMessage(interpreter + " error: " + error);
    });
    // Pass current file contents to lua's stdin
    luaProcess.stdin.end(new Buffer(document.getText()));
    luaProcess.on("exit", function (code, signal) {
        if (!currentDiagnostic) {
            diagnosticCollection.clear();
        }
        else {
            diagnosticCollection.set(document.uri, [currentDiagnostic]);
            // Optionally show warining message
            if (warnOnError && lualinterConfig.get("warnOnSave")) {
                vscode.window.showWarningMessage("Current file contains an error: '${currentDiagnostic.message}' at line ${currentDiagnostic.range.start.line}");
            }
        }
    });
}
function activate(context) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('lua');
    context.subscriptions.push(diagnosticCollection);
    vscode.workspace.onDidSaveTextDocument(function (document) { return lintDocument(document, true); });
    vscode.workspace.onDidChangeTextDocument(function (event) { return lintDocument(event.document); });
    vscode.workspace.onDidOpenTextDocument(function (document) { return lintDocument(document); });
    vscode.window.onDidChangeActiveTextEditor(function (editor) { return lintDocument(editor.document); });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map