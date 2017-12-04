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
})(GinkgoTestKind || (GinkgoTestKind = {}));
function getTestSpecs(doc) {
    return new Promise((resolve, reject) => {
        const ginkgooRuntimePath = ginkgoTestRunner_1.getGinkgoPath();
        if (!ginkgooRuntimePath) {
            vscode.window.showErrorMessage('Not able to find "ginkgo" binary in GOPATH');
            reject();
            return;
        }
        const dir = path.dirname(doc.fileName);
        const spawnedGinkgo = cp.spawnSync(ginkgooRuntimePath, ['-regexScansFilePath', '-noisyPendings=false', '-noColor', '-dryRun', '-v', `-focus="${doc.fileName}"`], { cwd: dir, shell: true });
        if (spawnedGinkgo.status !== 0) {
            reject('ginkgo exit code error');
            return;
        }
        resolve(getSpecsFromOutput(spawnedGinkgo.stdout.toString(), doc));
    });
}
exports.getTestSpecs = getTestSpecs;
function getSpecsFromOutput(output, doc) {
    const specLines = output.split('\n').filter(ginkgoOutputFilter).map(s => s.trim());
    const specIndices = getTestIndices(doc.getText(), GinkgoTestKind.It);
    const specs = [];
    for (let i = 0; i < specLines.length; i += 3) {
        specs.push({
            fullSpecString: `${specLines[i]} ${specLines[i + 1]} ${specLines[i + 2].split(':')[0]}`,
            location: new vscode.Location(doc.uri, doc.positionAt(specIndices[i / 3]))
        });
    }
    return specs;
}
function ginkgoOutputFilter(line) {
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
//# sourceMappingURL=ginkgoSpecProvider.js.map