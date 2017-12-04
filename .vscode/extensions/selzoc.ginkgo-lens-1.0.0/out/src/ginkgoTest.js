'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
let outputChannel = vscode.window.createOutputChannel('Ginkgo Tests');
function runGinkgoTestsForFile(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }
    return getTestFunctions(editor.document)
        .then(testFunctions => ginkgoTest(path.dirname(editor.document.fileName)))
        .then(null, err => {
        console.error(err);
        return Promise.resolve(false);
    });
}
exports.runGinkgoTestsForFile = runGinkgoTestsForFile;
function runGinkgoTestAtCursor(args) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active.');
        return;
    }
    if (!editor.document.fileName.endsWith('_test.go')) {
        vscode.window.showInformationMessage('No tests found. Current file is not a test file.');
        return;
    }
    if (editor.document.isDirty) {
        vscode.window.showInformationMessage('File has unsaved changes. Save and try again.');
        return;
    }
    getTestFunctions(editor.document).then(testFunctions => {
        let testFunctionName;
        // We use functionName if it was provided as argument
        // Otherwise find any test function containing the cursor.
        if (args && args.functionName) {
            testFunctionName = args.functionName;
        }
        else {
            for (let func of testFunctions) {
                let selection = editor.selection;
                if (selection && func.location.range.contains(selection.start)) {
                    testFunctionName = func.name;
                    break;
                }
            }
            ;
        }
        if (!testFunctionName) {
            vscode.window.showInformationMessage('No test function found at cursor.');
            return;
        }
        return ginkgoTest(path.dirname(editor.document.fileName), [testFunctionName]);
    }).then(null, err => {
        console.error(err);
    });
}
exports.runGinkgoTestAtCursor = runGinkgoTestAtCursor;
function ginkgoTest(dir, foci) {
    return new Promise((resolve, reject) => {
        outputChannel.clear();
        let args = ["-succinct"];
        let ginkgooRuntimePath = path.join(process.env['GOPATH'], 'bin', 'ginkgo');
        if (!ginkgooRuntimePath) {
            vscode.window.showInformationMessage('Cannot find "ginkgo" binary. Update PATH or GOROOT appropriately');
            return Promise.resolve();
        }
        if (foci) {
            args.push(`-focus=${foci.join('|')}`);
        }
        outputChannel.appendLine(['Running tool:', ginkgooRuntimePath, ...args].join(' '));
        outputChannel.appendLine('');
        let proc = cp.spawn(ginkgooRuntimePath, args, { cwd: dir });
        proc.stdout.on('data', chunk => outputChannel.append(chunk.toString()));
        proc.stderr.on('data', chunk => outputChannel.append(chunk.toString()));
        proc.on('close', code => {
            if (code) {
                outputChannel.append('Error: Tests failed.');
            }
            else {
                outputChannel.append('Success: Tests passed.');
            }
            resolve(code === 0);
        });
    });
}
exports.ginkgoTest = ginkgoTest;
function getTestFunctions(doc) {
    let docText = doc.getText();
    let itIndices = getItIndices(docText);
    let itTitles = itIndices.map(i => getItTitle(docText, i));
    let itSymbols = [];
    for (var i in itIndices) {
        let pos = doc.positionAt(itIndices[i]);
        let loc = new vscode.Location(doc.uri, pos);
        let symbol = new vscode.SymbolInformation(itTitles[i], vscode.SymbolKind.Function, "_", loc);
        itSymbols.push(symbol);
    }
    return Promise.resolve(itSymbols);
}
exports.getTestFunctions = getTestFunctions;
function getItTitle(docText, index) {
    let startQuote = index + 4;
    let endQuote = docText.indexOf('"', index + 4);
    return docText.substring(startQuote, endQuote);
}
function getItIndices(docText) {
    let indices = [];
    let i = 0;
    while (i !== -1) {
        let loc = docText.indexOf("It(", i);
        if (loc == -1) {
            break;
        }
        indices.push(loc);
        i = loc + 1;
    }
    return indices;
}
//# sourceMappingURL=ginkgoTest.js.map