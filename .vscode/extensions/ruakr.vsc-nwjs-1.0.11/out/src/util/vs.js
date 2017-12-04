"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const stream = require("stream");
const output = vscode_1.window.createOutputChannel("NWjs");
class ChannelStream extends stream.Writable {
    constructor() {
        super(...arguments);
        this._buffer = '';
        this._flushReserved = 0;
    }
    _flushToVsCode() {
        clear();
        if (this._buffer) {
            log(this._buffer);
            this._buffer = '';
        }
        this._flushReserved = 0;
    }
    end() {
        if (this._flushReserved) {
            clearTimeout(this._flushReserved);
            this._flushToVsCode();
        }
        super.end();
    }
    _write(chunk, encoding, done) {
        const str = chunk.toString();
        const CLEAR = '\x1b[1000D\x1b[0K';
        const clearidx = str.lastIndexOf(CLEAR);
        if (clearidx !== -1) {
            this._buffer = str.substr(clearidx + CLEAR.length);
            if (!this._flushReserved) {
                this._flushReserved = setTimeout(this._flushToVsCode.bind(this), 2000);
            }
        }
        else {
            if (!this._flushReserved) {
                log(str);
            }
            else {
                this._buffer += str;
            }
        }
        done();
    }
    bindWrite() {
        return this.write.bind(this);
    }
}
exports.ChannelStream = ChannelStream;
function log(value) {
    output.appendLine(value);
}
exports.log = log;
function show() {
    output.show();
}
exports.show = show;
function clear() {
    output.clear();
}
exports.clear = clear;
function errorBox(message, ...items) {
    return vscode_1.window.showErrorMessage(message, ...items);
}
exports.errorBox = errorBox;
function infoBox(msg) {
    return vscode_1.window.showInformationMessage(msg);
}
exports.infoBox = infoBox;
function open(file) {
    return vscode_1.workspace.openTextDocument(file)
        .then((doc) => vscode_1.window.showTextDocument(doc));
}
exports.open = open;
//# sourceMappingURL=vs.js.map