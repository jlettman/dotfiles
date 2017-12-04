'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies
 */
const os = require("os");
function getArch() {
    const arch = os.arch();
    if (arch === 'ai32' && exports.platform === 'win') {
        if (process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
            return 'x64';
        }
    }
    return arch;
}
function getPlatform() {
    const platformstr = os.platform();
    switch (platformstr) {
        case 'darwin': return 'osx';
        case 'win32': return 'win';
        default: return platformstr;
    }
}
exports.platform = getPlatform();
exports.arch = getArch();
exports.supportArch = new Set;
if (exports.arch === 'x64' && (exports.platform === 'win' || exports.platform === 'linux')) {
    exports.supportArch.add('ia32');
}
exports.supportArch.add(exports.arch);
//# sourceMappingURL=os.js.map