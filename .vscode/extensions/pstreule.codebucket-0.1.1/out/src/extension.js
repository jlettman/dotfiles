"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const command_open_1 = require("./command/command-open");
const command_open_changeset_1 = require("./command/command-open-changeset");
const command_open_issue_1 = require("./command/command-open-issue");
const command_open_pullrequest_1 = require("./command/command-open-pullrequest");
function activate(context) {
    const openInBitbucket = new command_open_1.OpenInBitbucketCommand();
    const openInBitbucketCmd = vscode.commands.registerCommand('codebucket.open', () => openInBitbucket.run());
    context.subscriptions.push(openInBitbucketCmd);
    const openChangeset = new command_open_changeset_1.OpenBitbucketChangesetCommand();
    const openChangesetCmd = vscode.commands.registerCommand('codebucket.openChangeset', () => openChangeset.run());
    context.subscriptions.push(openChangesetCmd);
    const openPullRequest = new command_open_pullrequest_1.OpenBitbucketPullRequestCommand();
    const openPullRequestCmd = vscode.commands.registerCommand('codebucket.openPullRequest', () => openPullRequest.run());
    context.subscriptions.push(openPullRequestCmd);
    const openIssue = new command_open_issue_1.OpenInIssueTrackerCommand();
    const openIssueCmd = vscode.commands.registerCommand('codebucket.openIssue', () => openIssue.run());
    context.subscriptions.push(openIssueCmd);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map