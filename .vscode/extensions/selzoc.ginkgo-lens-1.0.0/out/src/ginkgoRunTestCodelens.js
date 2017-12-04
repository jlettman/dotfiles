'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ginkgoSpecProvider_1 = require("./ginkgoSpecProvider");
class GinkgoRunTestCodeLensProvider {
    provideCodeLenses(document, token) {
        const ginkgoConfig = vscode.workspace.getConfiguration('ginkgolens');
        return Promise.all([
            this.getCodeLensesForFile(document),
            this.getCodeLensesForIts(document)
        ]).then(res => {
            const codeLenses = [];
            if (ginkgoConfig.get('includeFile'))
                codeLenses.push(...res[0]);
            if (ginkgoConfig.get('includeIts'))
                codeLenses.push(...res[1]);
            return codeLenses;
        });
    }
    getCodeLensesForFile(document) {
        if (document.fileName.endsWith('_suite_test.go')) {
            return Promise.resolve([]);
        }
        return Promise.resolve([
            new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
                title: 'run file tests with ginkgo',
                command: 'ginkgo.test.file',
                arguments: [{ path: document.uri.fsPath }]
            })
        ]);
    }
    getCodeLensesForIts(document) {
        return ginkgoSpecProvider_1.getTestSpecs(document)
            .then(testSpecs => testSpecs.map(spec => new vscode.CodeLens(spec.location.range, {
            title: 'run test',
            command: 'ginkgo.test.focus',
            arguments: [{ testFocus: spec.fullSpecString }]
        })));
    }
}
exports.GinkgoRunTestCodeLensProvider = GinkgoRunTestCodeLensProvider;
//# sourceMappingURL=ginkgoRunTestCodeLens.js.map