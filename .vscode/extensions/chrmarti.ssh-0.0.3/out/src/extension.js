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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path_1 = require("path");
const fs_1 = require("fs");
const vscode_1 = require("vscode");
const userConfig = process.env.HOME && path_1.join(process.env.HOME, '.ssh/config');
const snippets = [(() => {
        const item = new vscode_1.CompletionItem('Configure tunnel');
        item.documentation = 'Insert a template for configuring a tunnel connection.';
        item.insertText = new vscode_1.SnippetString('Host ${1:alias}\n    HostName ${2:fqn}\n    LocalForward ${4:port} ${5:localhost}:${4:port}\n    User ${6:user}');
        return item;
    })()];
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('ssh.launch', () => launch()));
    context.subscriptions.push(vscode_1.commands.registerCommand('ssh.openUserConfig', () => openUserConfig()));
    context.subscriptions.push(vscode_1.commands.registerCommand('ssh.openWorkspaceConfig', () => openWorkspaceConfig().catch(console.error)));
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider('ssh_config', { provideCompletionItems }, ' '));
}
exports.activate = activate;
let options;
function getOptions() {
    return options || (options = new Promise((resolve, reject) => {
        fs_1.readFile(path_1.join(__dirname, '../../thirdparty/options.json'), { encoding: 'utf8' }, (err, content) => {
            err ? reject(err) : resolve(JSON.parse(content));
        });
    }));
}
function provideCompletionItems(document, position) {
    const prefix = document.lineAt(position).text.substr(0, position.character);
    if (/^\s*[^\s]*$/.test(prefix)) {
        return getOptions().then(options => options.map(option => {
            const item = new vscode_1.CompletionItem(option.label);
            item.documentation = option.documentation;
            return item;
        }).concat(snippets));
    }
}
function launch() {
    const configFiles = [];
    if (userConfig) {
        configFiles.push(userConfig);
    }
    if (vscode_1.workspace.workspaceFolders) {
        for (const folder of vscode_1.workspace.workspaceFolders) {
            configFiles.push(workspaceConfigPath(folder.uri.fsPath));
        }
    }
    Promise.all(configFiles.map(loadHosts))
        .then(hostsArray => {
        const hosts = hostsArray.reduce((all, hosts) => all.concat(hosts), []);
        return vscode_1.window.showQuickPick(hosts.sort((a, b) => a.label.localeCompare(b.label)), { placeHolder: 'Choose which configuration to launch' })
            .then(host => {
            if (host) {
                const terminal = vscode_1.window.createTerminal();
                terminal.show();
                if (terminal.onData) {
                    let sent = false;
                    const send = () => {
                        if (!sent) {
                            sent = true;
                            sendLaunch(terminal, host);
                        }
                    };
                    terminal.onData(send);
                    setTimeout(send, 3000);
                }
                else {
                    sendLaunch(terminal, host);
                }
            }
        });
    });
}
function sendLaunch(terminal, host) {
    terminal.sendText(host.configFile !== userConfig ? `ssh -F ${vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 1 ? relativize(host.configFile) : workspaceConfigPath('.')} ${host.label}` : `ssh ${host.label}`, false);
}
function loadHosts(configFile) {
    return fileExists(configFile)
        .then(exists => {
        return exists ? vscode_1.workspace.openTextDocument(vscode_1.Uri.file(configFile))
            .then(config => {
            const text = config.getText();
            const r = /^Host\s+([^\s]+)/gm;
            const hosts = [];
            let host;
            while (host = (r.exec(text) || [])[1]) {
                hosts.push({
                    label: host,
                    description: shortPath(configFile),
                    configFile
                });
            }
            return hosts;
        }) : [];
    });
}
function relativize(path) {
    if (process.env.HOME) {
        return '~/' + path_1.relative(process.env.HOME, path);
    }
    return path;
}
function shortPath(path) {
    const options = [path];
    if (process.env.HOME) {
        options.push('~/' + path_1.relative(process.env.HOME, path));
    }
    if (vscode_1.workspace.workspaceFolders) {
        for (const folder of vscode_1.workspace.workspaceFolders) {
            options.push(path_1.join(folder.name, path_1.relative(folder.uri.fsPath, path)));
        }
    }
    return options.reduce((min, path) => min.length <= path.length ? min : path);
}
function openUserConfig() {
    if (!userConfig) {
        return vscode_1.window.showInformationMessage('HOME environment variable not set');
    }
    return openConfig(userConfig);
}
function openWorkspaceConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const folders = vscode_1.workspace.workspaceFolders;
        if (!folders || !folders.length) {
            return vscode_1.window.showInformationMessage('No folder opened');
        }
        const folder = folders.length > 1 ? yield vscode_1.window.showWorkspaceFolderPick() : folders[0];
        if (folder) {
            return openConfig(workspaceConfigPath(folder.uri.fsPath));
        }
    });
}
function workspaceConfigPath(folderPath) {
    return path_1.join(folderPath, '.vscode/ssh.config');
}
function openConfig(path) {
    return fileExists(path)
        .then(exists => {
        return vscode_1.workspace.openTextDocument(exists ? vscode_1.Uri.file(path) : vscode_1.Uri.file(path).with({ scheme: 'untitled' }))
            .then(document => {
            return vscode_1.window.showTextDocument(document);
        });
    });
}
function fileExists(path) {
    return new Promise((resolve, reject) => {
        fs_1.lstat(path, (err, stats) => {
            if (!err) {
                resolve(true);
            }
            else if (err.code === 'ENOENT') {
                resolve(false);
            }
            else {
                reject(err);
            }
        });
    });
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map