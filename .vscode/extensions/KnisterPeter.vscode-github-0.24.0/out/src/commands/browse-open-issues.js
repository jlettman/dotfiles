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
const command_1 = require("../command");
const helper_1 = require("../helper");
let BrowseOpenIssues = class BrowseOpenIssues extends command_1.TokenCommand {
    runWithToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = yield this.githubManager.issues();
            if (issues.length > 0) {
                const selected = yield vscode.window.showQuickPick(issues.map(issue => ({
                    label: `${issue.title}`,
                    description: `#${issue.number}`,
                    issue
                })));
                if (selected) {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(selected.issue.html_url));
                }
            }
            else {
                vscode.window.showInformationMessage(`No open issues found`);
            }
        });
    }
};
__decorate([
    helper_1.showProgress,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrowseOpenIssues.prototype, "runWithToken", null);
BrowseOpenIssues = __decorate([
    tsdi_1.component
], BrowseOpenIssues);
exports.BrowseOpenIssues = BrowseOpenIssues;
//# sourceMappingURL=browse-open-issues.js.map