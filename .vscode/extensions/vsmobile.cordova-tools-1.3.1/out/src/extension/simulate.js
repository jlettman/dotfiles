"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("../utils/hash");
const Q = require("q");
const path = require("path");
const cordova_simulate_1 = require("cordova-simulate");
const cordovaSimulateTelemetry_1 = require("../utils/cordovaSimulateTelemetry");
const cordovaProjectHelper_1 = require("../utils/cordovaProjectHelper");
const vscode = require("vscode");
/**
 * Plugin simulation entry point.
 */
class PluginSimulator {
    simulate(fsPath, simulateOptions, projectType) {
        return this.launchServer(fsPath, simulateOptions, projectType)
            .then(() => this.launchAppHost(simulateOptions.target))
            .then(() => this.launchSimHost(fsPath));
    }
    launchAppHost(target) {
        return cordova_simulate_1.launchBrowser(target, this.simulationInfo.appHostUrl);
    }
    launchSimHost(fsPath) {
        const uri = vscode.Uri.file(fsPath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const simulateProtocol = 'cordova-simulate-' + hash_1.Hash.hashCode(workspaceFolder.uri.fsPath);
        const simulateUri = vscode.Uri.parse(simulateProtocol + '://authority/cordova-simulate');
        if (!this.simulator) {
            return Q.reject(new Error("Launching sim host before starting simulation server"));
        }
        let provider = new SimHostContentProvider(this.simulator.simHostUrl(), simulateUri);
        this.registration = vscode.workspace.registerTextDocumentContentProvider(simulateProtocol, provider);
        return Q(vscode.commands.executeCommand("vscode.previewHtml", simulateUri, vscode.ViewColumn.Two).then(() => provider.fireChange()));
    }
    launchServer(fsPath, simulateOptions, projectType) {
        const uri = vscode.Uri.file(fsPath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        simulateOptions.dir = workspaceFolder.uri.fsPath;
        if (!simulateOptions.simulationpath) {
            simulateOptions.simulationpath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'simulate');
            ;
        }
        return Q({}).then(() => {
            if (this.isServerRunning()) {
                /* close the server old instance */
                return this.simulator.stopSimulation();
            }
        })
            .then(() => {
            let simulateTelemetryWrapper = new cordovaSimulateTelemetry_1.CordovaSimulateTelemetry();
            simulateOptions.telemetry = simulateTelemetryWrapper;
            this.simulator = new cordova_simulate_1.Simulator(simulateOptions);
            let platforms = cordovaProjectHelper_1.CordovaProjectHelper.getInstalledPlatforms(workspaceFolder.uri.fsPath);
            let platform = simulateOptions.platform;
            let isPlatformMissing = platform && platforms.indexOf(platform) < 0;
            if (isPlatformMissing) {
                let command = "cordova";
                if (projectType.ionic || projectType.ionic2) {
                    command = "ionic";
                }
                throw new Error(`Couldn't find platform ${platform} in project, please install it using '${command} platform add ${platform}'`);
            }
            return this.simulator.startSimulation()
                .then(() => {
                this.simulationInfo = {
                    appHostUrl: this.simulator.appUrl(),
                    simHostUrl: this.simulator.simHostUrl(),
                    urlRoot: this.simulator.urlRoot(),
                };
                if (projectType.ionic2 && platform && platform !== "browser") {
                    this.simulationInfo.appHostUrl = `${this.simulationInfo.appHostUrl}?ionicplatform=${simulateOptions.platform}`;
                }
                return this.simulationInfo;
            });
        });
    }
    isServerRunning() {
        return this.simulator && this.simulator.isRunning();
    }
    dispose() {
        if (this.registration) {
            this.registration.dispose();
            this.registration = null;
        }
        if (this.simulator) {
            this.simulator.stopSimulation().done(() => { }, () => { });
            this.simulator = null;
        }
    }
}
exports.PluginSimulator = PluginSimulator;
/**
 * Content provider hosting the simulation UI inside a document.
 */
class SimHostContentProvider {
    constructor(simHostUrl, simulateUri) {
        this.changeEmitter = new vscode.EventEmitter();
        this.simHostUrl = simHostUrl;
        this.simulateUri = simulateUri;
    }
    get onDidChange() {
        return this.changeEmitter.event;
    }
    fireChange() {
        this.changeEmitter.fire(this.simulateUri);
    }
    provideTextDocumentContent(uri) {
        // always return different html so that the tab is properly reloaded and events are fired
        return `<!DOCTYPE html>
                <html>
                <head>
                    <style>
                        html, body {
                            height: 100%;
                            margin: 0;
                            overflow: hidden;
                        }

                        .intrinsic-container iframe {
                            position: absolute;
                            top:0;
                            left: 0;
                            border: 0;
                            width: 100%;
                            height: 100%;
                        }
                    </style>
                </head>
                <body>
                    <div style="display: none">
                        Always be changing ${Math.random()}
                    </div>
                    <div class="intrinsic-container">
                        <iframe src="${this.simHostUrl}" ></iframe>
                    </div>
                </body>
                </html>`;
    }
}

//# sourceMappingURL=simulate.js.map
