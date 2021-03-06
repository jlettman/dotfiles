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
const system_1 = require("../system");
const vscode_1 = require("vscode");
const common_1 = require("./common");
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
const copy_paste_1 = require("copy-paste");
class CopyShaToClipboardCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.CopyShaToClipboard);
        this.git = git;
    }
    preExecute(context, args = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (common_1.isCommandViewContextWithCommit(context)) {
                args = Object.assign({}, args);
                args.sha = context.node.commit.sha;
                return this.execute(context.editor, context.node.commit.uri, args);
            }
            return this.execute(context.editor, context.uri, args);
        });
    }
    execute(editor, uri, args = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            uri = common_1.getCommandUri(uri, editor);
            try {
                args = Object.assign({}, args);
                if (uri === undefined) {
                    const repoPath = yield this.git.getActiveRepoPath(editor);
                    if (!repoPath)
                        return undefined;
                    const log = yield this.git.getLogForRepo(repoPath, undefined, 1);
                    if (!log)
                        return undefined;
                    args.sha = system_1.Iterables.first(log.commits.values()).sha;
                    copy_paste_1.copy(args.sha);
                    return undefined;
                }
                const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
                if (args.sha === undefined) {
                    if (editor !== undefined && editor.document !== undefined && editor.document.isDirty)
                        return undefined;
                    const blameline = (editor && editor.selection.active.line) || 0;
                    if (blameline < 0)
                        return undefined;
                    try {
                        const blame = yield this.git.getBlameForLine(gitUri, blameline);
                        if (blame === undefined)
                            return undefined;
                        args.sha = blame.commit.sha;
                    }
                    catch (ex) {
                        logger_1.Logger.error(ex, 'CopyShaToClipboardCommand', `getBlameForLine(${blameline})`);
                        return vscode_1.window.showErrorMessage(`Unable to copy commit id. See output channel for more details`);
                    }
                }
                copy_paste_1.copy(args.sha);
                return undefined;
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'CopyShaToClipboardCommand');
                return vscode_1.window.showErrorMessage(`Unable to copy commit id. See output channel for more details`);
            }
        });
    }
}
exports.CopyShaToClipboardCommand = CopyShaToClipboardCommand;
//# sourceMappingURL=copyShaToClipboard.js.map