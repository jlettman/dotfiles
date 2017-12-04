'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies
 */
const home = require('user-home');
const shelljs_1 = require("shelljs");
const fse = require("fs-extra");
const path = require("path");
const fs = require("fs");
const nfs = require("../util/nfs");
const getVersions = require('nwjs-versions');
const nugget = require('nugget');
const extract = require('extract-zip');
const pify = require('pify');
const os = require("./os");
const PLATFORM_LEVELS = {
    'ia32': 1,
    'x64': 2,
};
class VersionInfo {
    constructor() {
        this.version = '';
        this.sdk = false;
        this.platform = '';
        this.arch = '';
        // resetable values
        this.versionText = '';
        this.versions = null;
        this.exver = '';
        this.ext = '';
        this.label = '';
        this.description = '';
        this.detail = '';
    }
    getRootPathSync() {
        const nw = path.join(home, '.nwjs', this.getFileName());
        if (!fs.existsSync(nw))
            return null;
        return nw;
    }
    getRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const nw = path.join(home, '.nwjs', this.getFileName());
            if (!(yield nfs.exists(nw)))
                return null;
            return nw;
        });
    }
    getNwjcSync() {
        const root = this.getRootPathSync();
        if (root === null)
            return null;
        let nw;
        switch (os.platform) {
            case 'osx':
                nw = 'nwjc';
                break;
            case 'win':
                nw = 'nwjc.exe';
                break;
            default:
                nw = 'nwjc';
                break;
        }
        return path.join(root, nw);
    }
    getNwjc() {
        return __awaiter(this, void 0, void 0, function* () {
            const root = yield this.getRootPath();
            if (root === null)
                return null;
            let nw;
            switch (os.platform) {
                case 'osx':
                    nw = 'nwjc';
                    break;
                case 'win':
                    nw = 'nwjc.exe';
                    break;
                default:
                    nw = 'nwjc';
                    break;
            }
            return path.join(root, nw);
        });
    }
    getPathSync() {
        const root = this.getRootPathSync();
        if (root === null)
            return null;
        let nw;
        switch (os.platform) {
            case 'osx':
                nw = 'nwjs.app/Contents/MacOS/nwjs';
                break;
            case 'win':
                nw = 'nw.exe';
                break;
            default:
                nw = 'nw';
                break;
        }
        return path.join(root, nw);
    }
    getPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const root = yield this.getRootPath();
            if (root === null)
                return null;
            let nw;
            switch (os.platform) {
                case 'osx':
                    nw = 'nwjs.app/Contents/MacOS/nwjs';
                    break;
                case 'win':
                    nw = 'nw.exe';
                    break;
                default:
                    nw = 'nw';
                    break;
            }
            return path.join(root, nw);
        });
    }
    existsSync() {
        return this.getRootPathSync() !== null;
    }
    exists() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootPathSync()) !== null;
        });
    }
    getUrl() {
        return `http://dl.nwjs.io/v${this.version}/${this.getFileName()}.${this.ext}`;
    }
    getSdkVersion() {
        const sdkv = new VersionInfo;
        sdkv.version = this.version;
        sdkv.sdk = true;
        sdkv.platform = this.platform;
        sdkv.arch = this.arch;
        sdkv.update();
        return sdkv;
    }
    isAvailable() {
        if (this.platform !== os.platform)
            return false;
        return os.supportArch.has(this.arch);
    }
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Download NWjs(" + this.versionText + ")...");
            if (yield this.exists())
                return false;
            // Create cache dir
            const cacheDir = path.join(home, '.nwjs');
            try {
                fs.mkdirSync(cacheDir);
            }
            catch (e) { }
            // Download the nwjs
            yield pify(nugget)(this.getUrl(), { dir: cacheDir, target: `${this.versionText}.${this.ext}`, verbose: true, proxy: process.env.HTTP_PROXY });
            // extract both zip and tarball
            const from = `${cacheDir}/${this.versionText}.${this.ext}`;
            if (os.platform === 'linux') {
                shelljs_1.exec(`tar -xzvf ${from} -C ${cacheDir}`, { silent: true });
            }
            else {
                yield pify(extract)(from, { dir: cacheDir });
            }
            // remove zip
            fs.unlinkSync(from);
            // print success info
            console.log(`Version ${this.versionText} is installed and activated`);
            return true;
        });
    }
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.exists()))
                return false;
            yield fse.remove(`${home}/.nwjs/${this.getFileName()}`);
            return true;
        });
    }
    getFileName() {
        var fileName = "nwjs-";
        if (this.sdk)
            fileName += 'sdk-';
        fileName += `v${this.version}-${this.platform}-${this.arch}`;
        return fileName;
    }
    update() {
        this.ext = this.platform === 'linux' ? 'tar.gz' : 'zip';
        var vread = this.version;
        const exver_idx = vread.indexOf('-');
        if (exver_idx !== -1) {
            this.exver = vread.substr(exver_idx + 1);
            vread = vread.substr(0, exver_idx);
        }
        this.versions = vread.split('.').map(v => +v);
        var versionText = this.version;
        if (this.sdk)
            versionText += '-sdk';
        if (this.platform !== os.platform) {
            versionText += `(${this.platform}-${this.arch})`;
        }
        else if (os.supportArch.size !== 1) {
            versionText += `(${this.arch})`;
        }
        this.versionText = versionText;
        this.label = this.version;
        this.description = this.platform + '-' + this.arch;
    }
    static fromVersionText(version) {
        var platform = os.platform;
        var arch = os.arch;
        const platformIdx = version.lastIndexOf('(');
        if (platformIdx !== -1) {
            const platformIdxEnd = version.lastIndexOf(')');
            const paltform_arch = version.substring(platformIdx + 1, platformIdxEnd);
            var [platform, arch] = paltform_arch.split('-');
            if (!arch) {
                arch = platform;
                platform = os.platform;
            }
            version = version.substr(0, platformIdx);
        }
        const info = new VersionInfo;
        if (version.endsWith('-sdk')) {
            version = version.substr(0, version.length - 4);
            info.sdk = true;
        }
        info.platform = platform;
        info.arch = arch;
        info.version = version;
        info.update();
        return info;
    }
    static fromFileName(filename) {
        if (!filename.startsWith('nwjs-'))
            return null;
        filename = filename.substr(5);
        var isSdk = false;
        if (filename.startsWith('sdk-')) {
            filename = filename.substr(4);
            isSdk = true;
        }
        if (!filename.startsWith('v'))
            return null;
        filename = filename.substr(1);
        function readTail() {
            const idx = filename.lastIndexOf('-');
            if (idx === -1)
                return '';
            const tail = filename.substr(idx + 1);
            filename = filename.substr(0, idx);
            return tail;
        }
        const arch = readTail();
        const platform = readTail();
        const info = new VersionInfo;
        info.sdk = isSdk;
        info.platform = platform;
        info.arch = arch;
        info.version = filename;
        info.update();
        return info;
    }
    toString() {
        return this.versionText;
    }
}
exports.VersionInfo = VersionInfo;
function archCompare(a, b) {
    var alv = PLATFORM_LEVELS[a] || 3;
    var blv = PLATFORM_LEVELS[b] || 3;
    return alv - blv;
}
function versionCompare(a, b) {
    const count = Math.min(a.versions.length, b.versions.length);
    for (var i = 0; i < count; i++) {
        const delta = b.versions[i] - a.versions[i];
        if (delta !== 0)
            return delta;
    }
    return (b.versions.length - a.versions.length) ||
        (+a.sdk - +b.sdk) ||
        b.ext.localeCompare(a.ext) ||
        b.platform.localeCompare(a.platform) ||
        archCompare(b.arch, a.arch);
}
function getFirstOfArray(array, cmp) {
    if (array.length === 0)
        return undefined;
    var v = array[0];
    for (var i = 1; i < array.length; i++) {
        const v2 = array[i];
        if (cmp(v, v2) > 0)
            v = v2;
    }
    return v;
}
function getLatestVersion(filter) {
    if (!filter)
        filter = () => true;
    return list(ver => ver.isAvailable() && filter(ver)).then(vers => {
        if (vers.length === 0)
            return null;
        return vers[0];
    });
}
exports.getLatestVersion = getLatestVersion;
function getLatestVersionSync(filter) {
    if (!filter)
        filter = () => true;
    var vers = listSync(ver => ver.isAvailable() && filter(ver));
    if (vers.length === 0)
        return null;
    return vers[0];
}
exports.getLatestVersionSync = getLatestVersionSync;
function listAll(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const supportArchs = [...os.supportArch];
        var list = yield getVersions();
        list = list.reduce((a, b) => {
            for (const arch of supportArchs) {
                a.push(`${b}(${arch})`);
            }
            return a;
        }, []);
        var verisonList = list.map(v => VersionInfo.fromVersionText(v));
        if (filter)
            verisonList = verisonList.filter(filter);
        return verisonList.sort(versionCompare);
    });
}
exports.listAll = listAll;
function list(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        var versions = yield pify(fs).readdir(`${home}/.nwjs`).catch(() => []);
        var infos = versions.map(v => VersionInfo.fromFileName(v)).filter(v => v);
        if (filter)
            infos = infos.filter(filter);
        return infos.sort(versionCompare);
    });
}
exports.list = list;
function listSync(filter) {
    var versions = fs.readdirSync(`${home}/.nwjs`);
    var infos = versions.map(v => VersionInfo.fromFileName(v)).filter(v => v);
    if (filter)
        infos = infos.filter(filter);
    return infos.sort(versionCompare);
}
exports.listSync = listSync;
//# sourceMappingURL=nwjs.js.map