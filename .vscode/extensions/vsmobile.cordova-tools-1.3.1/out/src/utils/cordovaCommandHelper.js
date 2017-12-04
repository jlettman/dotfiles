"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const Q = require("q");
const os = require("os");
const util = require("util");
const vscode_1 = require("vscode");
const telemetryHelper_1 = require("./telemetryHelper");
const configurationReader_1 = require("../common/configurationReader");
class CordovaCommandHelper {
    static executeCordovaCommand(projectRoot, command, useIonic = false) {
        var telemetryEventName = CordovaCommandHelper.CORDOVA_TELEMETRY_EVENT_NAME;
        var cliCommandName = CordovaCommandHelper.CORDOVA_CMD_NAME;
        var cliDisplayName = CordovaCommandHelper.CORDOVA_DISPLAY_NAME;
        if (useIonic) {
            telemetryEventName = CordovaCommandHelper.IONIC_TELEMETRY_EVENT_NAME;
            cliCommandName = CordovaCommandHelper.IONIC_CMD_NAME;
            cliDisplayName = CordovaCommandHelper.IONIC_DISPLAY_NAME;
        }
        telemetryHelper_1.TelemetryHelper.generate(telemetryEventName, (generator) => {
            generator.add('command', command, false);
            let outputChannel = vscode_1.window.createOutputChannel("cordova");
            let commandToExecute = cliCommandName + " " + command;
            if (useIonic && os.platform() === 'win32' && ['build', 'run'].indexOf(command) >= 0) {
                // ionic build/run commands use 'ios' as default platform, even on Windows, which
                // causes them to fail w/ odd “You cannot run iOS unless you are on Mac OSX” error.
                // To prevent this we enforce these commands to use 'android' in such case
                commandToExecute += ' android';
            }
            const runArgs = CordovaCommandHelper.getRunArguments(projectRoot);
            if (runArgs.length) {
                commandToExecute += ' ' + runArgs.join(' ');
            }
            outputChannel.appendLine("########### EXECUTING: " + commandToExecute + " ###########");
            outputChannel.show();
            let process = child_process.exec(commandToExecute, { cwd: projectRoot });
            let deferred = Q.defer();
            process.on("error", (err) => {
                // ENOENT error will be thrown if no Cordova.cmd or ionic.cmd is found
                if (err.code === "ENOENT") {
                    vscode_1.window.showErrorMessage(util.format("%s not found, please run 'npm install –g %s' to install %s globally", cliDisplayName, cliDisplayName.toLowerCase(), cliDisplayName));
                }
                deferred.reject(err);
            });
            process.stderr.on('data', (data) => {
                outputChannel.append(data);
            });
            process.stdout.on('data', (data) => {
                outputChannel.append(data);
            });
            process.stdout.on("close", (exitCode) => {
                outputChannel.appendLine("########### FINISHED EXECUTING : " + commandToExecute + " ###########");
                deferred.resolve({});
            });
            return telemetryHelper_1.TelemetryHelper.determineProjectTypes(projectRoot)
                .then((projectType) => generator.add('projectType', projectType, false))
                .then(() => deferred.promise);
        });
    }
    /**
     * Get command line run arguments from settings.json
     */
    static getRunArguments(fsPath) {
        let uri = vscode_1.Uri.file(fsPath);
        const workspaceConfiguration = vscode_1.workspace.getConfiguration("cordova", uri);
        const configKey = 'runArguments';
        if (workspaceConfiguration.has(configKey)) {
            return configurationReader_1.ConfigurationReader.readArray(workspaceConfiguration.get(configKey));
        }
        return [];
    }
}
CordovaCommandHelper.CORDOVA_CMD_NAME = os.platform() === "win32" ? "cordova.cmd" : "cordova";
CordovaCommandHelper.IONIC_CMD_NAME = os.platform() === "win32" ? "ionic.cmd" : "ionic";
CordovaCommandHelper.CORDOVA_TELEMETRY_EVENT_NAME = "cordovaCommand";
CordovaCommandHelper.IONIC_TELEMETRY_EVENT_NAME = "ionicCommand";
CordovaCommandHelper.CORDOVA_DISPLAY_NAME = "Cordova";
CordovaCommandHelper.IONIC_DISPLAY_NAME = "Ionic";
exports.CordovaCommandHelper = CordovaCommandHelper;

//# sourceMappingURL=cordovaCommandHelper.js.map
