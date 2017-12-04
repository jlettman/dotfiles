'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const vscode = require("vscode");
const telemetry_1 = require("../telemetry");
const constants_1 = require("../telemetry/constants");
const jediHelpers_1 = require("./jediHelpers");
const proxy = require("./jediProxy");
class PythonHoverProvider {
    constructor(jediFactory) {
        this.jediFactory = jediFactory;
    }
    static parseData(data, currentWord) {
        const results = [];
        const capturedInfo = [];
        data.items.forEach(item => {
            let { signature } = item;
            switch (item.kind) {
                case vscode.SymbolKind.Constructor:
                case vscode.SymbolKind.Function:
                case vscode.SymbolKind.Method: {
                    signature = `def ${signature}`;
                    break;
                }
                case vscode.SymbolKind.Class: {
                    signature = `class ${signature}`;
                    break;
                }
                default: {
                    signature = typeof item.text === 'string' && item.text.length > 0 ? item.text : currentWord;
                }
            }
            if (item.docstring) {
                let lines = item.docstring.split(/\r?\n/);
                // If the docstring starts with the signature, then remove those lines from the docstring.
                if (lines.length > 0 && item.signature.indexOf(lines[0]) === 0) {
                    lines.shift();
                    const endIndex = lines.findIndex(line => item.signature.endsWith(line));
                    if (endIndex >= 0) {
                        lines = lines.filter((line, index) => index > endIndex);
                    }
                }
                if (lines.length > 0 && item.signature.startsWith(currentWord) && lines[0].startsWith(currentWord) && lines[0].endsWith(')')) {
                    lines.shift();
                }
                const descriptionWithHighlightedCode = jediHelpers_1.highlightCode(lines.join(os_1.EOL));
                const hoverInfo = ['```python', signature, '```', descriptionWithHighlightedCode].join(os_1.EOL);
                const key = signature + lines.join('');
                // Sometimes we have duplicate documentation, one with a period at the end.
                if (capturedInfo.indexOf(key) >= 0 || capturedInfo.indexOf(`${key}.`) >= 0) {
                    return;
                }
                capturedInfo.push(key);
                capturedInfo.push(`${key}.`);
                results.push(hoverInfo);
                return;
            }
            if (item.description) {
                const descriptionWithHighlightedCode = jediHelpers_1.highlightCode(item.description);
                // tslint:disable-next-line:prefer-template
                const hoverInfo = '```python' + os_1.EOL + signature + os_1.EOL + '```' + os_1.EOL + descriptionWithHighlightedCode;
                const lines = item.description.split(os_1.EOL);
                const key = signature + lines.join('');
                // Sometimes we have duplicate documentation, one with a period at the end.
                if (capturedInfo.indexOf(key) >= 0 || capturedInfo.indexOf(`${key}.`) >= 0) {
                    return;
                }
                capturedInfo.push(key);
                capturedInfo.push(`${key}.`);
                results.push(hoverInfo);
            }
        });
        return new vscode.Hover(results);
    }
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = document.fileName;
            if (document.lineAt(position.line).text.match(/^\s*\/\//)) {
                return null;
            }
            if (position.character <= 0) {
                return null;
            }
            const range = document.getWordRangeAtPosition(position);
            if (!range || range.isEmpty) {
                return null;
            }
            const word = document.getText(range);
            const cmd = {
                command: proxy.CommandType.Hover,
                fileName: filename,
                columnIndex: range.end.character,
                lineIndex: position.line
            };
            if (document.isDirty) {
                cmd.source = document.getText();
            }
            const data = yield this.jediFactory.getJediProxyHandler(document.uri).sendCommand(cmd, token);
            if (!data || !data.items.length) {
                return;
            }
            return PythonHoverProvider.parseData(data, word);
        });
    }
}
__decorate([
    telemetry_1.captureTelemetry(constants_1.HOVER_DEFINITION)
], PythonHoverProvider.prototype, "provideHover", null);
exports.PythonHoverProvider = PythonHoverProvider;
//# sourceMappingURL=hoverProvider.js.map