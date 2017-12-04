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
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
function getFileDiffs(diffLines) {
    function getFileDiff(n) {
        let matches = 0;
        const fromIndex = diffLines.findIndex(line => line.startsWith('diff --git a/') && n === matches++);
        const lines = diffLines.slice(fromIndex);
        if (!lines[0].startsWith('diff --git a/')) {
            throw new Error('Invalid diff');
        }
        const fileRegexp = /^diff --git a\/(\S+)/;
        const path = fileRegexp.exec(lines[0])[1];
        const start = lines.findIndex(line => line.startsWith('@@ '));
        let end = lines.slice(start).findIndex(line => line.startsWith('diff --git a/')) - 1;
        end = start + (end >= 0 ? end : lines.slice(start).length);
        return {
            path,
            lines: lines.slice(start, end + 1)
        };
    }
    return diffLines
        .filter(line => line.startsWith('diff --git a/'))
        .map((_, index) => getFileDiff(index));
}
function isCommentForLine(comment, line) {
    const lines = comment.diff_hunk.split('\n');
    const position = parseInt(/^@@\ -\d+,\d+\ \+(\d+)/.exec(lines[0])[1], 10) - 1;
    return position + lines.length - 1 === line;
}
function getPullRequestNumber(uri) {
    const params = uri.query
        .split('&')
        .reduce((params, param) => {
        const [name, value] = param.split('=');
        params[name] = value;
        return params;
    }, {});
    return parseInt(params['pr'], 10);
}
class GithubReviewDocumentContentProvider {
    constructor(githubManager) {
        this._onDidChange = new vscode.EventEmitter();
        this.githubManager = githubManager;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    provideTextDocumentContent(uri, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequest = yield this.githubManager.getPullRequest(getPullRequestNumber(uri));
            if (!pullRequest) {
                vscode.window.showInformationMessage('No pull request found');
                return;
            }
            const diff = yield (yield node_fetch_1.default(pullRequest.diff_url)).text();
            const fileDiffs = getFileDiffs(diff.split('\n'));
            const comments = yield this.githubManager.getPullRequestReviewComments(pullRequest);
            const html = `
      <html>
      <head>
        <style type="text/css">
          html, body {
            margin: 0.3em;
            padding: 0;
          }
          h3 {
            margin: 0;
            font-weight: normal;
          }
          .hunk {
            color: #666;
          }
          .container {
            display: flex;
            width: 100%;
            font-family: monospace;
          }
          .side {
            flex: 1 1 auto;
            padding: 0 0.8em;
            border: 1px solid #aaa;
          }
          .line {
            line-height: 1.5em;
          }
          .line.add {
            background-color: #e6ffed;
          }
          .line.del {
            background-color: #ffeef0;
          }
          .line .number {
            display: inline-block;
            text-align: right;
            width: 3em;
          }
          .line .content {
            display: inline-block;
          }
          .comment {
            margin: 1em 0;
            padding: 1em;
            border: 1px solid #aaa;
        </style>
      </head>
      <body>
        ${fileDiffs.map(fileDiff => this.renderFile(fileDiff, comments)).join('')}
      </body>
      </html>
    `;
            return html;
        });
    }
    renderFile(diff, comments) {
        const lineClass = (line) => ['line', line.startsWith('-') && 'del', line.startsWith('+') && 'add']
            .filter(className => Boolean(className))
            .join(' ');
        return `
      <h3>${diff.path}</h3>
      <div class="hunk">${diff.lines[0]}</div>
      <div class="container">
        <div class="side">
          ${diff.lines.slice(1).map((line, index) => `
            <div class="${lineClass(line)}">
              <div class="number">${index + 1}</div>
              <div class="content">${line.substring(1)}</div>
            </div>
            ${this.renderComments(comments, diff, index)}
          `).join('')}
        </div>
      </div>
    `;
    }
    renderComments(comments, diff, line) {
        return comments
            .filter(comment => comment.path === diff.path)
            .filter(comment => isCommentForLine(comment, line))
            .map(comment => {
            return `
          <div class="comment">
            ${comment.body}
          </div>
        `;
        })
            .join('');
    }
}
exports.GithubReviewDocumentContentProvider = GithubReviewDocumentContentProvider;
//# sourceMappingURL=review.js.map