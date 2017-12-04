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
const path = require("path");
const vscode = require("vscode");
const backend_git_1 = require("../backend/backend-git");
const error_1 = require("../error");
const issuetracker_bitbucket_1 = require("../issuetracker/issuetracker-bitbucket");
const issuetracker_jira_1 = require("../issuetracker/issuetracker-jira");
const settings_1 = require("../settings");
const shell_1 = require("../shell");
class CommandBase {
    /**
     * Run the command and handle any resulting errors
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.execute();
            }
            catch (e) {
                if (e instanceof error_1.CodeBucketError) {
                    vscode.window.showInformationMessage(e.message);
                }
                else {
                    // tslint:disable-next-line:no-console
                    console.error(e);
                    vscode.window.showErrorMessage(`Encountered an unexpected error: ${e.message}`);
                }
            }
        });
    }
    /**
     * Get the backend (Git or Mercurial) for the current project.
     */
    getBackend() {
        return __awaiter(this, void 0, void 0, function* () {
            const workingDirectory = this.getDirectory();
            const shell = new shell_1.Shell(workingDirectory);
            for (const backend of [backend_git_1.GitBackend]) {
                const { code, stdout } = yield shell.exec(backend.root);
                if (code === 0) {
                    return new backend(stdout.trim());
                }
            }
            throw new error_1.CodeBucketError('Unable to find a Git/Hg repository');
        });
    }
    /**
     * Get the open directory containing the current file.
     */
    getDirectory() {
        const editor = this.getOpenEditor();
        return path.dirname(editor.document.fileName);
    }
    /**
     * Get the path to the current file, relative to the repository root.
     */
    getFilePath(root) {
        const editor = this.getOpenEditor();
        return path.relative(root, editor.document.fileName);
    }
    /**
     * Get the list of currently selected line ranges, in start:end format
     */
    getLineRanges() {
        const editor = this.getOpenEditor();
        return editor.selections.map(selection => {
            // vscode provides 0-based line numbers but Bitbucket line numbers start with 1.
            return `${selection.start.line + 1}:${selection.end.line + 1}`;
        });
    }
    /**
     * Get the 1-based line number of the (first) currently selected line.
     */
    getCurrentLine() {
        const selection = this.getOpenEditor().selection;
        return selection.start.line + 1;
    }
    /**
     * Open a URL in the default browser.
     */
    openUrl(url) {
        const uri = vscode.Uri.parse(url);
        vscode.commands.executeCommand('vscode.open', uri);
    }
    /**
     * Returns all configured issue trackers
     */
    getIssueTrackers() {
        return __awaiter(this, void 0, void 0, function* () {
            const trackers = settings_1.issueTrackers().map(tracker => {
                switch (tracker.type) {
                    case 'jira': return new issuetracker_jira_1.JiraIssueTracker(tracker);
                    default: throw new error_1.CodeBucketError(`Unknown issue tracker type: ${tracker.type}`);
                }
            });
            const backend = yield this.getBackend();
            const remote = yield backend.findBitbucketRemote();
            trackers.push(new issuetracker_bitbucket_1.BitbucketIssueTracker(remote));
            return trackers;
        });
    }
    getOpenEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new error_1.CodeBucketError('No open editor');
        }
        return editor;
    }
}
exports.CommandBase = CommandBase;
//# sourceMappingURL=command-base.js.map