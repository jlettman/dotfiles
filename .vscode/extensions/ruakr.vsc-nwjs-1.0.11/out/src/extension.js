"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Core = require("vscode-chrome-debug-core");
const utils_1 = require("./utils");
const { window } = vscode;
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const glob = require("glob-all");
const nwjs = require("./nwjs/nwjs");
const os = require("./nwjs/os");
const run_1 = require("./util/run");
const nfs = require("./util/nfs");
const vs = require("./util/vs");
const util = require("./util/util");
const NEED_INSTALL = 'NEED_INSTALL';
const NEED_PUBLISH_JSON = 'NEED_PUBLISH_JSON';
const NEED_PACKAGE_JSON = 'NEED_PACKAGE_JSON';
const DEFAULT_PACKAGE_JSON = {
    name: 'untitled',
    main: 'index.html'
};
const DEFAULT_PUBLISH_JSON = {
    "version": 'any',
    "package": {},
    "html": ["index.html"],
    "files": [],
    "exclude": []
};
var onProgress = false;
var selectedFile = '';
var selectedDir = '';
function replaceExt(filename, ext) {
    const extidx = filename.lastIndexOf('.');
    if (Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\')) < extidx)
        return filename.substr(0, extidx) + '.' + ext;
    else
        return filename + '.' + ext;
}
function installNWjs(version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!version) {
            version = yield window.showQuickPick(nwjs.listAll().then((list) => __awaiter(this, void 0, void 0, function* () {
                const have = yield nwjs.list();
                const haveset = new Set();
                for (const info of have) {
                    haveset.add(info.versionText);
                }
                for (const info of list) {
                    if (haveset.has(info.versionText)) {
                        info.description += ' (Installed)';
                    }
                }
                return list;
            })), { placeHolder: "Select install version" });
            if (!version)
                return;
        }
        var downloaded = false;
        downloaded = (yield version.install()) || downloaded;
        downloaded = (yield version.getSdkVersion().install()) || downloaded;
        vs.clear();
        if (downloaded)
            vs.infoBox("Install complete");
        else
            vs.infoBox("NWjs already installed");
    });
}
function removeNWjs() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = yield window.showQuickPick(nwjs.list(v => !v.sdk), { placeHolder: "Select remove version" });
        if (!version)
            return;
        var res = false;
        res = (yield version.remove()) || res;
        res = (yield version.getSdkVersion().remove()) || res;
        if (res)
            vs.infoBox("Remove complete");
        else
            vs.infoBox("NWjs already removed");
    });
}
function compileNWjs(version, filename, outputFile) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!version) {
            var versions = yield nwjs.list();
            versions = versions.filter(v => !v.sdk);
            if (versions.length !== 1)
                version = yield window.showQuickPick(versions, { placeHolder: "Select compiler version" });
            else
                version = versions[0];
            if (!version)
                return;
        }
        if (!filename)
            filename = selectedFile;
        if (!outputFile)
            outputFile = replaceExt(filename, '.bin');
        const path = yield version.getSdkVersion().getNwjc();
        if (path === null)
            throw new Error(NEED_INSTALL + '#' + version.versionText);
        yield run_1.run(path, [filename, outputFile], str => vs.log(str));
    });
}
function makeNWjs(outdir, version, nwfile, packageJson, exclude) {
    return __awaiter(this, void 0, void 0, function* () {
        const excludeMap = {};
        for (const ex of exclude)
            excludeMap[ex] = true;
        excludeMap['nw.exe'] = true;
        const srcdir = yield version.getRootPath();
        if (srcdir === null)
            throw Error('Installed NWjs not found');
        for (const src of glob.sync([srcdir + '/**'])) {
            const name = src.substr(srcdir.length + 1);
            if (name in excludeMap)
                continue;
            const dest = path.join(outdir, name);
            if (fs.statSync(src).isDirectory()) {
                try {
                    fs.mkdirSync(dest);
                }
                catch (e) { }
            }
            else {
                yield nfs.copy(src, dest);
            }
        }
        if (os.platform === 'osx') {
            // Contents/Resources/nw.icns: icon of your app.
            // Contents/Info.plist: the apple package description file.
            yield nfs.copy(nwfile, path.join(outdir, 'nwjs.app/Contents/Resources/app.nw'));
        }
        else {
            const nwjsPath = yield version.getPath();
            if (nwjsPath === null)
                throw Error('Installed NWjs not found');
            const exepath = path.join(outdir, packageJson.name + '.exe');
            const fos = fs.createWriteStream(exepath);
            yield nfs.writeTo(nwjsPath, fos);
            yield nfs.writeTo(nwfile, fos);
            fos.end();
        }
    });
}
function publishNWjs() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!window.activeTextEditor)
            return;
        const config = nfs.readJson('nwjs.publish.json', DEFAULT_PUBLISH_JSON);
        if (!config)
            throw new Error(NEED_PUBLISH_JSON);
        const exclude = resolveToStringArray(config.exclude);
        const files = resolveToStringArray(config.files);
        const html = resolveToStringArray(config.html);
        var version;
        {
            const versionText = resolveToString(config.nwjsVersion);
            if (!versionText || versionText === 'any') {
                version = yield nwjs.getLatestVersion();
                if (!version)
                    throw new Error(NEED_INSTALL);
            }
            else {
                version = nwjs.VersionInfo.fromVersionText(versionText);
            }
        }
        const nwjsPath = yield version.getPath();
        if (nwjsPath === null)
            throw new Error(NEED_INSTALL + '#' + version.versionText);
        const curdir = process.cwd();
        process.chdir(path.dirname(window.activeTextEditor.document.fileName));
        const targets = {};
        const bindir = 'bin';
        const publishdir = 'publish';
        const packagejson = nfs.readJson('package.json', DEFAULT_PACKAGE_JSON);
        if (!packagejson)
            throw new Error(NEED_PACKAGE_JSON);
        util.override(packagejson, config.package);
        nfs.mkdir(bindir);
        nfs.mkdir(publishdir);
        const zippath = path.join(bindir, packagejson.name + '.zip');
        vs.show();
        vs.log('Convert html...');
        const archive = archiver('zip', { store: true });
        const zipfos = fs.createWriteStream(zippath);
        archive.pipe(zipfos);
        function appendText(filename, text) {
            archive.append(text, { name: filename });
        }
        function appendFile(filename, from) {
            if (from === undefined)
                from = filename;
            archive.file(from, { name: filename });
        }
        appendText('package.json', JSON.stringify(packagejson));
        for (const src of glob.sync(html)) {
            vs.log(src);
            const script = yield nfs.readFile(src);
            appendText(src, replaceScriptTag(script, targets));
        }
        vs.log('Compile js...');
        for (const src in targets) {
            vs.log(src);
            const binfilename = targets[src];
            const dest = path.join(bindir, binfilename);
            nfs.mkdir(path.dirname(dest));
            yield compileNWjs(version, src, dest);
            appendFile(binfilename, dest);
        }
        vs.log('Add files...');
        for (const src of glob.sync(files)) {
            if (fs.statSync(src).isDirectory())
                continue;
            vs.log(src);
            appendFile(src);
        }
        vs.log('Flush zip...');
        archive.finalize();
        yield nfs.eventToPromise(zipfos, 'close');
        vs.log('Generate exe...');
        yield makeNWjs(publishdir, version, zippath, packagejson, exclude);
        process.chdir(curdir);
        vs.log('Complete');
    });
}
function generatePublishJson() {
    return __awaiter(this, void 0, void 0, function* () {
        nfs.writeJson('nwjs.publish.json', DEFAULT_PUBLISH_JSON);
        vs.open(path.resolve('nwjs.publish.json'));
    });
}
function generatePackageJson() {
    return __awaiter(this, void 0, void 0, function* () {
        nfs.writeJson('package.json', DEFAULT_PACKAGE_JSON);
        vs.open(path.resolve('package.json'));
    });
}
function oncatch(err) {
    if (!err) {
        vs.log(err.stack);
        vs.errorBox(err + '');
        return;
    }
    const errobj = err;
    if (errobj._value) {
        err = errobj._value;
    }
    if (!err.message) {
        vs.log(err.stack);
        try {
            vs.errorBox(JSON.stringify(err));
        }
        catch (e) {
            vs.errorBox(err + '');
        }
        return;
    }
    const errarray = err.message.split('#', 2);
    const [msg, param] = err.message.split('#', 2);
    switch (msg) {
        case NEED_INSTALL:
            return vs.errorBox('Need install NWjs!', 'Install')
                .then((select) => {
                if (!select)
                    return;
                return installNWjs(nwjs.VersionInfo.fromVersionText(param)).catch(oncatch);
            });
        case NEED_PUBLISH_JSON:
            return vs.errorBox('Need nwjs.publish.json!', 'Generate')
                .then((select) => {
                if (!select)
                    return;
                return generatePublishJson().catch(oncatch);
            });
        case NEED_PACKAGE_JSON:
            return vs.errorBox('Need package.json!', 'Generate')
                .then((select) => {
                if (!select)
                    return;
                return generatePackageJson().catch(oncatch);
            });
        default:
            vs.log(err.stack);
            vs.errorBox(err.stack);
            break;
    }
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('vscode-nwjs.toggleSkippingFile', toggleSkippingFile));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-nwjs.startSession', startSession));
    console.log('[extension: vscode-nwjs] activate');
    function regist(command, oncommand) {
        const disposable = vscode.commands.registerCommand(command, () => {
            try {
                if (onProgress) {
                    vs.show();
                    return;
                }
                onProgress = true;
                vs.clear();
                vs.show();
                const stdout = process.stdout.write;
                const stderr = process.stderr.write;
                const channelStream = new vs.ChannelStream();
                process.stderr.write = process.stdout.write = channelStream.bindWrite();
                var olddir = '';
                if (window.activeTextEditor) {
                    selectedFile = window.activeTextEditor.document.fileName;
                    selectedDir = path.dirname(selectedFile);
                    olddir = process.cwd();
                    process.chdir(selectedDir);
                }
                else {
                    selectedFile = '';
                    selectedDir = '';
                }
                Promise.resolve()
                    .then(() => oncommand())
                    .catch(oncatch)
                    .then(() => {
                    if (olddir)
                        process.chdir(olddir);
                    channelStream.end();
                    process.stdout.write = stdout;
                    process.stderr.write = stderr;
                    onProgress = false;
                });
            }
            catch (err) {
                vs.log(err.stack);
                vs.errorBox(err.error);
            }
        });
        context.subscriptions.push(disposable);
    }
    regist('vscode-nwjs.install', installNWjs);
    regist('vscode-nwjs.remove', removeNWjs);
    regist('vscode-nwjs.publish', publishNWjs);
    regist('vscode-nwjs.compile', compileNWjs);
}
exports.activate = activate;
function deactivate() {
    console.log('[extension: vscode-nwjs] deactivate');
}
exports.deactivate = deactivate;
function toggleSkippingFile(path) {
    if (!path) {
        const activeEditor = vscode.window.activeTextEditor;
        path = activeEditor && activeEditor.document.fileName;
    }
    const args = typeof path === 'string' ? { path } : { sourceReference: path };
    vscode.commands.executeCommand('workbench.customDebugRequest', 'toggleSkipFileStatus', args);
}
;
function startSession(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.request === 'attach') {
            const discovery = new Core.chromeTargetDiscoveryStrategy.ChromeTargetDiscovery(new Core.NullLogger(), new Core.telemetry.NullTelemetryReporter());
            const targets = yield discovery.getAllTargets(config.address || '127.0.0.1', config.port, utils_1.targetFilter, config.url);
            if (targets.length > 1) {
                const selectedTarget = yield pickTarget(targets);
                if (!selectedTarget) {
                    // Quickpick canceled, bail
                    return;
                }
                config.websocketUrl = selectedTarget.websocketDebuggerUrl;
            }
        }
        if (config.request) {
            vscode.commands.executeCommand('vscode.startDebug', config);
            return Promise.resolve({ status: 'ok' });
        }
        else {
            return Promise.resolve({ status: 'initialConfiguration' });
        }
    });
}
function pickTarget(targets) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = targets.map(target => ({
            label: unescapeTargetTitle(target.title),
            detail: target.url,
            websocketDebuggerUrl: target.webSocketDebuggerUrl
        }));
        const selected = yield vscode.window.showQuickPick(items, { placeHolder: 'Select a tab', matchOnDescription: true, matchOnDetail: true });
        return selected;
    });
}
function unescapeTargetTitle(title) {
    return title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, `'`)
        .replace(/&quot;/g, '"');
}
function replaceScriptTag(html, compileTargets) {
    const regexp = /<script([ \t]+[^>]+)?>/g;
    const prop = /[ \t]+src=(["'])([^"']+)\1/;
    var out = '';
    var previous = 0;
    for (;;) {
        const res = regexp.exec(html);
        if (!res)
            break;
        const propres = prop.exec(res[1]);
        const end = html.indexOf("</script>", regexp.lastIndex);
        if (propres && propres[2]) {
            const src = propres[2];
            out += html.substring(previous, res.index);
            const output = replaceExt(src, 'bin');
            out += `<script>require('nw.gui').Window.get().evalNWBin(null, '${output}');</script>`;
            previous = end + 9;
            compileTargets[src] = output;
        }
        regexp.lastIndex = end + 9;
    }
    out += html.substr(previous);
    return out;
}
function resolveToString(value) {
    if (value)
        return value + '';
    return '';
}
function resolveToStringArray(value) {
    if (!(value instanceof Array))
        return [];
    return value.map(resolveToString);
}
//# sourceMappingURL=extension.js.map