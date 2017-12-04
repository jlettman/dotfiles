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
const error_1 = require("../error");
const backend_base_1 = require("./backend-base");
class GitBackend extends backend_base_1.Backend {
    constructor(workingDirectory) {
        super(workingDirectory);
    }
    findCurrentRevision() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this.shell.lines('git show HEAD');
            for (const line of lines) {
                const match = line.match(/commit (\w+)/);
                if (match) {
                    return match[1];
                }
            }
            throw new error_1.CodeBucketError('Unable to get the current revision');
        });
    }
    findSelectedRevision(file, line) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.shell.output(`git blame --root -L ${line},${line} ${file}`);
            const match = output.match(/^(\w+)/);
            if (match) {
                return match[1];
            }
            throw new error_1.CodeBucketError('Unable to find the selected revision');
        });
    }
    getDefaultBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const remote = yield this.findBitbucketRemote();
            try {
                return yield this.shell.output(`git rev-parse --abbrev-ref refs/remotes/${remote.name}/HEAD`);
            }
            catch (e) {
                // tslint:disable-next-line:no-console
                console.error(`No remote HEAD found, falling back to ${remote.name}/master`);
                return `${remote.name}/master`;
            }
        });
    }
    getPullRequestId(targetRevision) {
        return __awaiter(this, void 0, void 0, function* () {
            const mergeRevision = yield this.getMergeRevision(targetRevision);
            const message = yield this.getRevisionMessage(mergeRevision);
            const match = message.match(/pull request #(\d+)/);
            if (match) {
                return parseInt(match[1], 10);
            }
            throw new error_1.CodeBucketError('Unable to determine the pull request where the commit was merged');
        });
    }
    getRemoteList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shell.lines('git remote -v');
        });
    }
    getRevisionMessage(revision) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shell.output(`git show ${revision} --format="%s%n%n%b" --no-patch`);
        });
    }
    getMergeRevision(targetRevision) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultBranch = yield this.getDefaultBranch();
            const revspec = `${targetRevision}..${defaultBranch}`;
            // First find the merge commit where the given commit was merged into the default branch.
            const ancestryPath = yield this.shell.lines(`git rev-list ${revspec} --ancestry-path --merges`);
            const firstParent = yield this.shell.lines(`git rev-list ${revspec} --first-parent --merges`);
            const firstParentSet = new Set(firstParent);
            const mergeRevision = ancestryPath.reverse().find(path => firstParentSet.has(path));
            if (!mergeRevision) {
                throw new error_1.CodeBucketError('Unable to determine the merge commit');
            }
            return mergeRevision;
        });
    }
}
GitBackend.root = 'git rev-parse --show-toplevel';
exports.GitBackend = GitBackend;
//# sourceMappingURL=backend-git.js.map