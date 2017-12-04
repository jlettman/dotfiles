"use strict";
const vscode = require('vscode');
(function (MODE) {
    MODE[MODE["EscapeUnicode"] = 0] = "EscapeUnicode";
    MODE[MODE["EscapeUnicodeES6"] = 1] = "EscapeUnicodeES6";
    MODE[MODE["EscapeHex"] = 2] = "EscapeHex";
    MODE[MODE["EscapeOctal"] = 3] = "EscapeOctal";
    MODE[MODE["UnescapeAll"] = 4] = "UnescapeAll";
    MODE[MODE["UnescapeUnicode"] = 5] = "UnescapeUnicode";
    MODE[MODE["UnescapeHex"] = 6] = "UnescapeHex";
    MODE[MODE["UnescapeOctal"] = 7] = "UnescapeOctal";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
const RX_EXTASCII = /([\u0080-\u00ff]+)/g;
const RX_NONASCII = /([^\u0000-\u007f]+)/g;
const RX_UNICODE = /(\\u([0-9A-Fa-f]{4}))/g;
const RX_UNICODE_ES6 = /(\\u\{([0-9A-Fa-f]{1,6})\})/g;
const RX_HEX = /(\\x([0-9A-Fa-f]{2}))/g;
const RX_OCTAL = /(\\([0-3][0-7]{2}))/g;
class Escaper {
    constructor() {
        this.process = (editor, mode) => {
            // Process entire document if user haven't selected a text block manually
            let selection = (() => {
                if (editor.selection.end.isAfter(editor.selection.start)) {
                    return editor.selection;
                }
                else {
                    let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
                    return new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(lastLine.lineNumber, lastLine.text.length));
                }
            })();
            editor.edit((builder) => {
                builder.replace(selection, this.processText(mode, editor.document.getText(selection)));
            });
        };
    }
    processText(mode, text) {
        switch (mode) {
            case MODE.EscapeHex: return this.escapeHex(text);
            case MODE.EscapeOctal: return this.escapeOctal(text);
            case MODE.EscapeUnicode: return this.escapeUnicode(text);
            case MODE.EscapeUnicodeES6: return this.escapeUnicodeES6(text);
            case MODE.UnescapeAll: return this.unescapeAll(text);
            case MODE.UnescapeHex: return this.unescapeHex(text);
            case MODE.UnescapeOctal: return this.unescapeOctal(text);
            case MODE.UnescapeUnicode: return this.unescapeUnicode(text);
        }
    }
    unescapeAll(text) {
        text = this.unescapeHex(text);
        text = this.unescapeOctal(text);
        text = this.unescapeUnicode(text);
        return text;
    }
    escapeUnicode(text) {
        return text.replace(RX_NONASCII, (match) => {
            let replacement = [];
            for (var index = 0; index < match.length; index++) {
                replacement.push('\\u' + ('0000' + match.charCodeAt(index).toString(16).toUpperCase()).slice(-4));
            }
            return replacement.join('');
        });
    }
    escapeUnicodeES6(text) {
        return text.replace(RX_NONASCII, (match) => {
            let replacement = [];
            for (let ch of match) {
                replacement.push(`\\u{${ch.codePointAt(0).toString(16).toUpperCase()}}`);
            }
            return replacement.join('');
        });
    }
    unescapeUnicode(text) {
        return text.replace(RX_UNICODE, (match, sequence, code) => {
            return String.fromCharCode(parseInt(code, 16));
        }).replace(RX_UNICODE_ES6, (match, sequence, code) => {
            return String.fromCodePoint(parseInt(code, 16));
        });
    }
    escapeHex(text) {
        return text.replace(RX_EXTASCII, (match) => {
            let replacement = [];
            for (var index = 0; index < match.length; index++) {
                replacement.push('\\x' + ('00' + match.charCodeAt(index).toString(16).toUpperCase()).slice(-2));
            }
            return replacement.join('');
        });
    }
    unescapeHex(text) {
        return text.replace(RX_HEX, (match, sequence, code) => {
            return String.fromCharCode(parseInt(code, 16));
        });
    }
    escapeOctal(text) {
        return text.replace(RX_EXTASCII, (match) => {
            let replacement = [];
            for (var index = 0; index < match.length; index++) {
                replacement.push('\\' + ('000' + match.charCodeAt(index).toString(8).toUpperCase()).slice(-3));
            }
            return replacement.join('');
        });
    }
    unescapeOctal(text) {
        return text.replace(RX_OCTAL, (match, sequence, code) => {
            return String.fromCharCode(parseInt(code, 8));
        });
    }
    dispose() { }
}
exports.Escaper = Escaper;
//# sourceMappingURL=escaper.js.map