"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsdi_1 = require("tsdi");
const vscode = require("vscode");
const git = require("./git");
const github_1 = require("./provider/github");
let GitHubManager = class GitHubManager {
    get cwd() {
        return this.folder.uri.fsPath;
    }
    log(message) {
        this.channel.appendLine(message);
        console.log(message);
    }
    get connected() {
        return Boolean(this.github);
    }
    getGitHubHostname() {
        return __awaiter(this, void 0, void 0, function* () {
            return git.getGitHubHostname(this.cwd);
        });
    }
    connect(tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            const hostname = yield git.getGitHubHostname(this.cwd);
            this.github = github_1.getClient(yield this.getApiEndpoint(), tokens[hostname].token);
        });
    }
    getApiEndpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostname = yield git.getGitHubHostname(this.cwd);
            if (hostname === 'github.com') {
                return 'https://api.github.com';
            }
            if (hostname.startsWith('http')) {
                return `${hostname}/api/v3`;
            }
            const protocol = git.getGitHubProtocol(this.cwd);
            return `${protocol}//${hostname}/api/v3`;
        });
    }
    getRepository() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            return (yield this.github.getRepository(owner, repository)).body;
        });
    }
    getDefaultBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRepository()).default_branch;
        });
    }
    getEnabledMergeMethods() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = yield this.getRepository();
            const set = new Set();
            if (repo.allow_merge_commit) {
                set.add('merge');
            }
            if (repo.allow_squash_merge) {
                set.add('squash');
            }
            if (repo.allow_rebase_merge) {
                set.add('rebase');
            }
            return set;
        });
    }
    getPullRequestForCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const branch = yield git.getCurrentBranch(this.cwd);
            const parameters = {
                state: 'open',
                head: `${owner}:${branch}`
            };
            const list = yield this.github.listPullRequests(owner, repository, parameters);
            if (list.body.length === 0) {
                return undefined;
            }
            return (yield this.github.getPullRequest(owner, repository, list.body[0].number)).body;
        });
    }
    hasPullRequestForCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            return Boolean(yield this.getPullRequestForCurrentBranch());
        });
    }
    getCombinedStatusForPullRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const branch = yield git.getCurrentBranch(this.cwd);
            if (!branch) {
                return undefined;
            }
            const response = yield this.github.getStatusForRef(owner, repository, branch);
            return response.body.total_count > 0 ? response.body.state : undefined;
        });
    }
    createPullRequest(upstream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.hasPullRequestForCurrentBranch()) {
                return undefined;
            }
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const branch = yield git.getCurrentBranch(this.cwd);
            if (!branch) {
                throw new Error('No current branch');
            }
            this.log(`Create pull request on branch ${branch}`);
            const firstCommit = yield git.getFirstCommitOnBranch(branch, this.cwd);
            this.log(`First commit on branch ${firstCommit}`);
            const requestBody = yield git.getPullRequestBody(firstCommit, this.cwd);
            if (requestBody === undefined) {
                vscode.window.showWarningMessage(`For some unknown reason no pull request body could be build; Aborting operation`);
                return undefined;
            }
            const body = {
                title: yield git.getCommitMessage(firstCommit, this.cwd),
                head: `${owner}:${branch}`,
                base: upstream ? upstream.branch : yield this.getDefaultBranch(),
                body: requestBody
            };
            this.channel.appendLine('Create pull request:');
            this.channel.appendLine(JSON.stringify(body, undefined, ' '));
            if (upstream) {
                return yield this.doCreatePullRequest(upstream.owner, upstream.repository, body);
            }
            return yield this.doCreatePullRequest(owner, repository, body);
        });
    }
    doCreatePullRequest(upstreamOwner, upstreamRepository, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.github.createPullRequest(upstreamOwner, upstreamRepository, body);
                // tslint:disable-next-line:comment-format
                // TODO: Pretend should optionally redirect
                const expr = new RegExp(`${yield this.getApiEndpoint()}/repos/[^/]+/[^/]+/pulls/([0-9]+)`);
                const number = expr.exec(result.headers['location'][0]);
                return (yield this.github
                    .getPullRequest(upstreamOwner, upstreamRepository, parseInt(number[1], 10)))
                    .body;
            }
            catch (e) {
                if (e instanceof github_1.GitHubError) {
                    console.log(e);
                    this.channel.appendLine('Create pull request error:');
                    this.channel.appendLine(JSON.stringify(e.response, undefined, ' '));
                }
                throw e;
            }
        });
    }
    listPullRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const parameters = {
                state: 'open'
            };
            return (yield this.github.listPullRequests(owner, repository, parameters)).body;
        });
    }
    mergePullRequest(pullRequest, method) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (pullRequest.mergeable) {
                    const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
                    const body = {
                        merge_method: method
                    };
                    const result = yield this.github.mergePullRequest(owner, repository, pullRequest.number, body);
                    return result.body.merged;
                }
                return undefined;
            }
            catch (e) {
                if (!(e instanceof github_1.GitHubError)) {
                    throw e;
                }
                this.channel.appendLine('Error while merging:');
                this.channel.appendLine(JSON.stringify(yield e.response.json(), undefined, ' '));
                // status 405 (method not allowed)
                // tslint:disable-next-line:comment-format
                // TODO...
                return false;
            }
        });
    }
    getGithubSlug() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            return `${owner}/${repo}`;
        });
    }
    getGithubUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostname = yield git.getGitHubHostname(this.cwd);
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            return `https://${hostname}/${owner}/${repo}`;
        });
    }
    getGithubFileUrl(file, line) {
        return __awaiter(this, void 0, void 0, function* () {
            const hostname = yield git.getGitHubHostname(this.cwd);
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const branch = yield git.getCurrentBranch(this.cwd);
            return `https://${hostname}/${owner}/${repo}/blob/${branch}/${file}#L${(line || 0) + 1}`;
        });
    }
    addAssignee(issue, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            yield this.github.addAssignees(owner, repo, issue, { assignees: [name] });
        });
    }
    removeAssignee(issue, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            yield this.github.removeAssignees(owner, repo, issue, { assignees: [name] });
        });
    }
    requestReview(issue, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            yield this.github.requestReview(owner, repo, issue, { reviewers: [name] });
        });
    }
    deleteReviewRequest(issue, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            yield this.github.deleteReviewRequest(owner, repo, issue, { reviewers: [name] });
        });
    }
    issues() {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repo] = yield git.getGitHubOwnerAndRepository(this.cwd);
            const result = yield this.github.issues(owner, repo, {
                sort: 'updated',
                direction: 'desc'
            });
            return result.body
                .filter(issue => !Boolean(issue.pull_request));
        });
    }
    getPullRequestReviewComments(pullRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const [owner, repository] = yield git.getGitHubOwnerAndRepository(this.cwd);
            return (yield this.github.getPullRequestComments(owner, repository, pullRequest.number)).body;
        });
    }
};
__decorate([
    tsdi_1.inject('vscode.WorkspaceFolder'),
    __metadata("design:type", Object)
], GitHubManager.prototype, "folder", void 0);
__decorate([
    tsdi_1.inject('vscode.OutputChannel'),
    __metadata("design:type", Object)
], GitHubManager.prototype, "channel", void 0);
GitHubManager = __decorate([
    tsdi_1.component
], GitHubManager);
exports.GitHubManager = GitHubManager;
//# sourceMappingURL=github-manager.js.map