/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class DebounceHelper {
    constructor(timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
    /**
     * If not waiting already, call fn after the timeout
     */
    wait(fn) {
        if (!this.waitToken) {
            this.waitToken = setTimeout(() => {
                this.waitToken = null;
                fn();
            }, this.timeoutMs);
        }
    }
    /**
     * If waiting for something, cancel it and call fn immediately
     */
    doAndCancel(fn) {
        if (this.waitToken) {
            clearTimeout(this.waitToken);
            this.waitToken = null;
        }
        fn();
    }
}
exports.DebounceHelper = DebounceHelper;
exports.targetFilter = target => target && (!target.type || target.type === 'page' || target.type === 'app');


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("vscode-chrome-debug-core");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(5);
const path = __webpack_require__(0);
function eventToPromise(stream, evname) {
    return new Promise((resolve) => {
        stream.on(evname, resolve);
    });
}
exports.eventToPromise = eventToPromise;
function readJson(file, def, forceCreate) {
    var obj = null;
    try {
        obj = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch (e) {
        if (!forceCreate)
            return null;
    }
    if (def) {
        var modified = false;
        if (!(obj instanceof Object)) {
            obj = {};
            modified = true;
        }
        for (const p in def) {
            if (p in obj)
                continue;
            obj[p] = def[p];
            modified = true;
        }
        if (forceCreate && modified)
            writeJson(file, obj);
    }
    return obj;
}
exports.readJson = readJson;
function writeJson(file, obj) {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8');
}
exports.writeJson = writeJson;
function mkdir(dirPath) {
    try {
        return fs.mkdirSync(dirPath);
    }
    catch (error) {
        switch (error.code) {
            case 'ENOENT':
                mkdir(path.dirname(dirPath));
                return fs.mkdirSync(dirPath);
            case 'EEXIST':
                return;
        }
        throw error;
    }
}
exports.mkdir = mkdir;
function writeTo(filename, fos) {
    const read = fs.createReadStream(filename);
    read.pipe(fos, { end: false });
    return eventToPromise(read, 'end');
}
exports.writeTo = writeTo;
function copy(from, to) {
    const fos = fs.createWriteStream(to);
    fs.createReadStream(from).pipe(fos);
    return eventToPromise(fos, 'close');
}
exports.copy = copy;
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
exports.readFile = readFile;
function exists(path) {
    return new Promise(resolve => fs.exists(path, resolve));
}
exports.exists = exists;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(1);
const path = __webpack_require__(0);
const vscode_chrome_debug_core_1 = __webpack_require__(3);
const child_process_1 = __webpack_require__(10);
const utils = __webpack_require__(2);
const nfs = __webpack_require__(4);
const nwjs = __webpack_require__(8);
const DefaultWebSourceMapPathOverrides = {
    'webpack:///./~/*': '${webRoot}/node_modules/*',
    'webpack:///./*': '${webRoot}/*',
    'webpack:///*': '*',
    'webpack:///src/*': '${webRoot}/*',
    'meteor://💻app/*': '${webRoot}/*'
};
const DEFAULT_PACKAGE_JSON = {
    name: 'untitled',
    main: 'index.html'
};
class ChromeDebugAdapter extends vscode_chrome_debug_core_1.ChromeDebugAdapter {
    initialize(args) {
        this._overlayHelper = new utils.DebounceHelper(/*timeoutMs=*/ 200);
        const capabilities = super.initialize(args);
        capabilities.supportsRestartRequest = true;
        return capabilities;
    }
    launch(args) {
        return super.launch(args).then(() => {
            // Check exists?
            var chromePath = args.runtimeExecutable;
            if (!chromePath) {
                const version = args.nwjsVersion;
                if (version && version !== 'any') {
                    chromePath = nwjs.VersionInfo.fromVersionText(version + '-sdk').getPathSync();
                    if (!chromePath) {
                        return vscode_chrome_debug_core_1.utils.errP(`Need to install NWjs ${version}! - Please use "NWjs Install" command.`);
                    }
                }
                else {
                    const latest = nwjs.getLatestVersionSync(v => v.sdk);
                    if (!latest) {
                        return vscode_chrome_debug_core_1.utils.errP(`Need to install NWjs! - Please use "NWjs Install" command.`);
                    }
                    chromePath = latest.getPathSync();
                    if (!chromePath) {
                        return vscode_chrome_debug_core_1.utils.errP(`Need to install NWjs! - Please use "NWjs Install" command.`);
                    }
                }
            }
            // Start with remote debugging enabled
            const port = args.port || 9222;
            const chromeArgs = [];
            if (!args.noDebug) {
                chromeArgs.push('--remote-debugging-port=' + port);
            }
            // Also start with extra stuff disabled
            // chromeArgs.push(...['--no-first-run', '--no-default-browser-check']);
            if (args.runtimeArgs) {
                chromeArgs.push(...args.runtimeArgs);
            }
            // Set a userDataDir by default, if not disabled with 'false' or already specified
            if (typeof args.userDataDir === 'undefined' && !args.runtimeExecutable) {
                args.userDataDir = path.join(os.tmpdir(), `vscode-chrome-debug-userdatadir_${port}`);
            }
            if (args.userDataDir) {
                chromeArgs.push('--user-data-dir=' + args.userDataDir);
            }
            // let launchUrl: string;
            // if (args.file) {
            //     launchUrl = coreUtils.pathToFileURL(args.file);
            // } else if (args.url) {
            //     launchUrl = args.url;
            // }
            const config = nfs.readJson(args.webRoot + "/package.json", DEFAULT_PACKAGE_JSON, true);
            const launchUrl = 'chrome-extension://*/' + config.main;
            chromeArgs.push('.');
            this._chromeProc = this.spawnChrome(chromePath, chromeArgs, !!args.runtimeExecutable, args.webRoot);
            this._chromeProc.on('error', (err) => {
                const errMsg = 'NWJS error: ' + err;
                vscode_chrome_debug_core_1.logger.error(errMsg);
                this.terminateSession(errMsg);
            });
            return args.noDebug ? undefined :
                this.doAttach(port, launchUrl || args.urlFilter, args.address, args.timeout, undefined, args.extraCRDPChannelPort);
        });
    }
    attach(args) {
        if (args.urlFilter) {
            args.url = args.urlFilter;
        }
        return super.attach(args);
    }
    commonArgs(args) {
        if (!args.webRoot && args.pathMapping && args.pathMapping['/']) {
            // Adapt pathMapping['/'] as the webRoot when not set, since webRoot is explicitly used in many places
            args.webRoot = args.pathMapping['/'];
        }
        args.sourceMaps = typeof args.sourceMaps === 'undefined' || args.sourceMaps;
        args.sourceMapPathOverrides = getSourceMapPathOverrides(args.webRoot, args.sourceMapPathOverrides);
        //args.skipFileRegExps = ['^chrome-extension:.*'];
        super.commonArgs(args);
    }
    doAttach(port, targetUrl, address, timeout, websocketUrl, extraCRDPChannelPort) {
        return super.doAttach(port, targetUrl, address, timeout, websocketUrl, extraCRDPChannelPort).then(() => {
            // Don't return this promise, a failure shouldn't fail attach
            this.globalEvaluate({ expression: 'navigator.userAgent', silent: true })
                .then(evalResponse => vscode_chrome_debug_core_1.logger.log('Target userAgent: ' + evalResponse.result.value), err => vscode_chrome_debug_core_1.logger.log('Getting userAgent failed: ' + err.message))
                .then(() => {
                const cacheDisabled = this._launchAttachArgs.disableNetworkCache || false;
                this.chrome.Network.setCacheDisabled({ cacheDisabled });
            });
        });
    }
    runConnection() {
        return [
            ...super.runConnection(),
            this.chrome.Page.enable(),
            this.chrome.Network.enable({})
        ];
    }
    onPaused(notification, expectingStopReason) {
        this._overlayHelper.doAndCancel(() => this.chrome.Page.configureOverlay({ message: ChromeDebugAdapter.PAGE_PAUSE_MESSAGE }).catch(() => { }));
        super.onPaused(notification, expectingStopReason);
    }
    threadName() {
        return 'Chrome';
    }
    onResumed() {
        this._overlayHelper.wait(() => this.chrome.Page.configureOverlay({}).catch(() => { }));
        super.onResumed();
    }
    disconnect(args) {
        const hadTerminated = this._hasTerminated;
        // Disconnect before killing Chrome, because running "taskkill" when it's paused sometimes doesn't kill it
        super.disconnect(args);
        if (this._chromeProc && !hadTerminated) {
            // Only kill Chrome if the 'disconnect' originated from vscode. If we previously terminated
            // due to Chrome shutting down, or devtools taking over, don't kill Chrome.
            if (vscode_chrome_debug_core_1.utils.getPlatform() === 0 /* Windows */ && this._chromePID) {
                // Run synchronously because this process may be killed before exec() would run
                const taskkillCmd = `taskkill /F /T /PID ${this._chromePID}`;
                vscode_chrome_debug_core_1.logger.log(`Killing Chrome process by pid: ${taskkillCmd}`);
                try {
                    child_process_1.execSync(taskkillCmd);
                }
                catch (e) {
                    // Can fail if Chrome was already open, and the process with _chromePID is gone.
                    // Or if it already shut down for some reason.
                }
            }
            else {
                vscode_chrome_debug_core_1.logger.log('Killing Chrome process');
                this._chromeProc.kill('SIGINT');
            }
        }
        this._chromeProc = null;
    }
    /**
     * Opt-in event called when the 'reload' button in the debug widget is pressed
     */
    restart() {
        return this.chrome.Page.reload({ ignoreCache: true });
    }
    spawnChrome(chromePath, chromeArgs, usingRuntimeExecutable, cwd) {
        if (vscode_chrome_debug_core_1.utils.getPlatform() === 0 /* Windows */ && !usingRuntimeExecutable) {
            const chromeProc = child_process_1.fork(getChromeSpawnHelperPath(), [chromePath, ...chromeArgs], { execArgv: [], silent: true, cwd });
            chromeProc.unref();
            chromeProc.on('message', data => {
                const pidStr = data.toString();
                vscode_chrome_debug_core_1.logger.log('got chrome PID: ' + pidStr);
                this._chromePID = parseInt(pidStr, 10);
            });
            chromeProc.on('error', (err) => {
                const errMsg = 'chromeSpawnHelper error: ' + err;
                vscode_chrome_debug_core_1.logger.error(errMsg);
            });
            chromeProc.stderr.on('data', data => {
                vscode_chrome_debug_core_1.logger.error('[chromeSpawnHelper] ' + data.toString());
            });
            chromeProc.stdout.on('data', data => {
                vscode_chrome_debug_core_1.logger.log('[chromeSpawnHelper] ' + data.toString());
            });
            return chromeProc;
        }
        else {
            vscode_chrome_debug_core_1.logger.log(`spawn('${chromePath}', ${JSON.stringify(chromeArgs)})`);
            const chromeProc = child_process_1.spawn(chromePath, chromeArgs, {
                detached: true,
                stdio: ['ignore'],
                cwd
            });
            chromeProc.unref();
            return chromeProc;
        }
    }
}
ChromeDebugAdapter.PAGE_PAUSE_MESSAGE = 'Paused in Visual Studio Code';
exports.ChromeDebugAdapter = ChromeDebugAdapter;
// Force override
ChromeDebugAdapter.prototype.shouldIgnoreScript = function (args) {
    return false;
    //return super.shouldIgnoreScript(args);
    // This ignore chrome-extention path
    // but nwjs contains local storage as chrome-extension
};
function getSourceMapPathOverrides(webRoot, sourceMapPathOverrides) {
    return sourceMapPathOverrides ? resolveWebRootPattern(webRoot, sourceMapPathOverrides, /*warnOnMissing=*/ true) :
        resolveWebRootPattern(webRoot, DefaultWebSourceMapPathOverrides, /*warnOnMissing=*/ false);
}
/**
 * Returns a copy of sourceMapPathOverrides with the ${webRoot} pattern resolved in all entries.
 */
function resolveWebRootPattern(webRoot, sourceMapPathOverrides, warnOnMissing) {
    const resolvedOverrides = {};
    for (let pattern in sourceMapPathOverrides) {
        const replacePattern = sourceMapPathOverrides[pattern];
        resolvedOverrides[pattern] = replacePattern;
        const webRootIndex = replacePattern.indexOf('${webRoot}');
        if (webRootIndex === 0) {
            if (webRoot) {
                resolvedOverrides[pattern] = replacePattern.replace('${webRoot}', webRoot);
            }
            else if (warnOnMissing) {
                vscode_chrome_debug_core_1.logger.log('Warning: sourceMapPathOverrides entry contains ${webRoot}, but webRoot is not set');
            }
        }
        else if (webRootIndex > 0) {
            vscode_chrome_debug_core_1.logger.log('Warning: in a sourceMapPathOverrides entry, ${webRoot} is only valid at the beginning of the path');
        }
    }
    return resolvedOverrides;
}
exports.resolveWebRootPattern = resolveWebRootPattern;
function getChromeSpawnHelperPath() {
    if (path.basename(__dirname) === 'src') {
        // For tests
        return path.join(__dirname, '../chromeSpawnHelper.js');
    }
    else {
        return path.join(__dirname, 'chromeSpawnHelper.js');
    }
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_chrome_debug_core_1 = __webpack_require__(3);
const path = __webpack_require__(0);
const os = __webpack_require__(1);
const utils_1 = __webpack_require__(2);
const chromeDebugAdapter_1 = __webpack_require__(6);
const EXTENSION_NAME = 'debugger-for-chrome';
let versionWithDefault =  false ? 'unspecified' : "1.0.11"; // Not built with webpack for tests
// non-.txt file types can't be uploaded to github
// also note that __dirname here is out/
const logFilePath = path.resolve(os.tmpdir(), 'vscode-chrome-debug.txt');
// const utils = require('./utils');
// utils.createFunctionListener(ChromeDebugSession.prototype, 'chromeDebugSession');
// utils.createFunctionListener(UrlPathTransformer.prototype, 'pathTransformer');
// utils.createFunctionListener(BaseSourceMapTransformer.prototype, 'sourceMapTransformer');
// utils.createFunctionListener(ChromeDebugAdapter.prototype, 'chromeAdapter');
// Start a ChromeDebugSession configured to only match 'page' targets, which are Chrome tabs.
// Cast because DebugSession is declared twice - in this repo's vscode-debugadapter, and that of -core... TODO
vscode_chrome_debug_core_1.ChromeDebugSession.run(vscode_chrome_debug_core_1.ChromeDebugSession.getSession({
    adapter: chromeDebugAdapter_1.ChromeDebugAdapter,
    extensionName: EXTENSION_NAME,
    logFilePath,
    targetFilter: utils_1.targetFilter,
    pathTransformer: vscode_chrome_debug_core_1.UrlPathTransformer,
    sourceMapTransformer: vscode_chrome_debug_core_1.BaseSourceMapTransformer,
}));
vscode_chrome_debug_core_1.logger.log(EXTENSION_NAME + ': ' + versionWithDefault);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

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
/**
 * Module dependencies
 */
const home = __webpack_require__(17);
const shelljs_1 = __webpack_require__(16);
const fse = __webpack_require__(12);
const path = __webpack_require__(0);
const fs = __webpack_require__(5);
const nfs = __webpack_require__(4);
const getVersions = __webpack_require__(14);
const nugget = __webpack_require__(13);
const extract = __webpack_require__(11);
const pify = __webpack_require__(15);
const os = __webpack_require__(9);
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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies
 */
const os = __webpack_require__(1);
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


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("extract-zip");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("nugget");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("nwjs-versions");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("pify");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("shelljs");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("user-home");

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map