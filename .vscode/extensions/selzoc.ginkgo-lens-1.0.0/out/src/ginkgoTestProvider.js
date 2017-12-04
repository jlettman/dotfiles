'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const path = require("path");
const ginkgoTestRunner_1 = require("./ginkgoTestRunner");
var GinkgoTestKind;
(function (GinkgoTestKind) {
    GinkgoTestKind[GinkgoTestKind["Describe"] = 0] = "Describe";
    GinkgoTestKind[GinkgoTestKind["It"] = 1] = "It";
})(GinkgoTestKind = exports.GinkgoTestKind || (exports.GinkgoTestKind = {}));
function getTestSpecs(doc, testKind) {
    return new Promise((resolve, reject) => {
        const ginkgooRuntimePath = ginkgoTestRunner_1.getGinkgoPath();
        if (!ginkgooRuntimePath) {
            vscode.window.showErrorMessage('Not able to find "ginkgo" binary in GOPATH');
            reject();
            return;
        }
        const dir = path.dirname(doc.fileName);
        const spawnedGinkgoOutput = cp.spawnSync(ginkgooRuntimePath, ['-regexScansFilePath', '-noisyPendings=false', '-noColor', '-dryRun', '-v', `-focus="${doc.fileName}"`], { cwd: dir, shell: true });
        const specs = getSpecsFromOutput(spawnedGinkgoOutput.stdout.toString(), doc);
        doc.lineAt(0).firstNonWhitespaceCharacterIndex;
        resolve(specs.map(s => new vscode.SymbolInformation(s.ConcatenatedString, vscode.SymbolKind.Function, 'Ginkgo test file', s.Location)));
    });
}
exports.getTestSpecs = getTestSpecs;
function ginkgoOutFilter(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0 ||
        trimmed.startsWith('Running Suite:') ||
        trimmed.startsWith('Random Seed') ||
        trimmed.startsWith('Will run') ||
        trimmed.startsWith('SUCCESS!') ||
        trimmed.startsWith('Ginkgo ran') ||
        trimmed.startsWith('Test Suite') ||
        trimmed.startsWith('•') ||
        /^Ran \d+ of \d+ Specs in/.test(trimmed) ||
        /^S+$/.test(trimmed) ||
        /^-+$/.test(trimmed) ||
        /^=+$/.test(trimmed)) {
        return false;
    }
    return true;
}
function getSpecsFromOutput(output, doc) {
    const specLines = output.split('\n').filter(ginkgoOutFilter).map(s => s.trim());
    const testIndices = getTestIndices(doc.getText(), GinkgoTestKind.It);
    const specs = [];
    for (let i = 0; i < specLines.length; i += 3) {
        specs.push({
            ConcatenatedString: `${specLines[i]} ${specLines[i + 1]} ${specLines[i + 2].split(':')[0]}`,
            Location: new vscode.Location(doc.uri, doc.positionAt(testIndices[i / 3]))
        });
    }
    return specs;
}
function getTestIndices(docText, testKind) {
    let testString = 'It(';
    if (testKind === GinkgoTestKind.Describe) {
        testString = 'Describe(';
    }
    const indices = [];
    let i = 0;
    while (i !== -1) {
        const loc = docText.indexOf(testString, i);
        if (loc == -1) {
            break;
        }
        indices.push(loc);
        i = loc + 1;
    }
    return indices;
}
//# sourceMappingURL=ginkgoTestProvider.js.map