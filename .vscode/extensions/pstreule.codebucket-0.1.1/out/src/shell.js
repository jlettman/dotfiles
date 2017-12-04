"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child = require("child_process");
const error_1 = require("./error");
class Shell {
    constructor(workingDirectory) {
        this.workingDirectory = workingDirectory;
    }
    exec(command, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const proc = child.spawn(command, args, {
                    cwd: this.workingDirectory,
                    shell: true
                });
                let stdout = '';
                let stderr = '';
                proc.stdout.on('data', data => {
                    stdout += data;
                });
                proc.stderr.on('data', data => {
                    stderr += data;
                });
                proc.on('close', code => resolve({ code, stdout, stderr }));
                proc.on('error', err => reject(err));
            });
        });
    }
    output(command, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.exec(command, ...args);
            if (result.code !== 0) {
                throw new error_1.CodeBucketError(`Error executing command ${command}: ${result.stderr}`);
            }
            return result.stdout.trim();
        });
    }
    lines(command, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.output(command, ...args);
            return output.split(/\r?\n/).filter(value => value.length > 0);
        });
    }
}
exports.Shell = Shell;
//# sourceMappingURL=shell.js.map