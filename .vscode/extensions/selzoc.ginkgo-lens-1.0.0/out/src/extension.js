'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ginkgoRunTestCodeLens_1 = require("./ginkgoRunTestCodeLens");
const ginkgoTestRunner_1 = require("./ginkgoTestRunner");
function activate(context) {
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({
        language: 'go',
        scheme: 'file',
        pattern: '**/**_test.go'
    }, new ginkgoRunTestCodeLens_1.GinkgoRunTestCodeLensProvider()), vscode.commands.registerCommand('ginkgo.test.file', (args) => ginkgoTestRunner_1.runGinkgoTestsForFile(vscode.workspace.getConfiguration('ginkgolens'), args)), vscode.commands.registerTextEditorCommand('ginkgo.test.focus', (editor, edit, args) => ginkgoTestRunner_1.runFocusedGinkgoTest(vscode.workspace.getConfiguration('ginkgolens'), editor, args)));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map