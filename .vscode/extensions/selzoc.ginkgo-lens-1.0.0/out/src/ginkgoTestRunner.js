'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const ginkgoTestOutput = vscode.window.createOutputChannel('Ginkgo');
const DirtyFileMessage = 'File has unsaved changes, please save and try again.';
/**
 * Runs ginkgo against the current file
 * @param ginkgoLensConfig ginkgolens vscode config section
 * @param args args passed to the invocation of the command - we assume it has a 'path' key
 */
function runGinkgoTestsForFile(ginkgoLensConfig, args) {
    if (args && args.path) {
        if (!args.path.endsWith('_test.go')) {
            vscode.window.showWarningMessage('Not a go test file (must end in "_test.go")');
            return;
        }
        const doc = vscode.workspace.textDocuments.find((doc) => doc.uri.path == args.path);
        if (doc.isDirty) {
            vscode.window.showWarningMessage(DirtyFileMessage);
            return;
        }
        return ginkgoTest(ginkgoLensConfig, path.dirname(doc.fileName), args.path);
    }
    console.log('oops no conditionals matched!');
}
exports.runGinkgoTestsForFile = runGinkgoTestsForFile;
/**
 * Runs ginkgo against the specified test
 * @param ginkgoLensConfig ginkgolens vscode config section
 * @param editor the editor containing the document in which the test resides
 * @param args args passed to the invocation of the command
 */
function runFocusedGinkgoTest(ginkgoLensConfig, editor, args) {
    if (args && args.testFocus) {
        if (editor.document.isDirty) {
            vscode.window.showWarningMessage(DirtyFileMessage);
            return;
        }
        const focusWithFile = `${args.testFocus} ${editor.document.fileName}`;
        return ginkgoTest(ginkgoLensConfig, path.dirname(editor.document.fileName), args.testFocus);
    }
    vscode.window.showInformationMessage('No test function found.');
}
exports.runFocusedGinkgoTest = runFocusedGinkgoTest;
function ginkgoTest(ginkgoLensConfig, dir, focus) {
    return new Promise((resolve, reject) => {
        const gingkoArgs = ginkgoLensConfig.get('ginkgoArgs');
        const args = ['-regexScansFilePath'].concat(gingkoArgs);
        const ginkgoRuntimePath = getGinkgoPath();
        if (!ginkgoRuntimePath) {
            vscode.window.showErrorMessage('Not able to find "ginkgo" binary in GOPATH');
            reject('ginkgo binary not found');
            return;
        }
        if (focus) {
            args.push(`-focus="${focus}"`);
        }
        ginkgoTestOutput.clear();
        ginkgoTestOutput.show(true);
        if (ginkgoLensConfig.get('showCommand')) {
            ginkgoTestOutput.appendLine(`Running command: ${ginkgoRuntimePath} ${args.join(' ')}\n`);
        }
        const spawnedGinkgo = cp.spawn(ginkgoRuntimePath, args, { cwd: dir, shell: true });
        spawnedGinkgo.on('error', err => reject(err));
        spawnedGinkgo.stdout.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
        spawnedGinkgo.stderr.on('data', chunk => ginkgoTestOutput.append(chunk.toString()));
        spawnedGinkgo.on('close', () => resolve());
    });
}
/**
 * Returns the absolute path of the ginkgo executable on the system
 */
function getGinkgoPath() {
    const defaultPath = path.join(process.env['GOPATH'], 'bin', 'ginkgo');
    if (fs.existsSync(defaultPath)) {
        return defaultPath;
    }
    return null;
}
exports.getGinkgoPath = getGinkgoPath;
//# sourceMappingURL=ginkgoTestRunner.js.map