"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const vscode = require("vscode");
const error_1 = require("./error");
function bitbucketHosts() {
    const config = vscode.workspace.getConfiguration('codebucket');
    const hosts = config.get('bitbucketHosts') || [];
    const hostSet = new Set(hosts.map(host => hostname(host)));
    hostSet.add('bitbucket.org');
    return hostSet;
}
exports.bitbucketHosts = bitbucketHosts;
function issueTrackers() {
    const config = vscode.workspace.getConfiguration('codebucket');
    const trackers = config.get('issueTrackers') || [];
    return trackers.map(tracker => {
        return Object.assign({}, tracker, { host: hostname(tracker.host) });
    });
}
exports.issueTrackers = issueTrackers;
function hostname(name) {
    const host = url.parse(name).hostname;
    if (!host) {
        throw new error_1.CodeBucketError(`Could not parse host name: ${name}`);
    }
    return host;
}
//# sourceMappingURL=settings.js.map