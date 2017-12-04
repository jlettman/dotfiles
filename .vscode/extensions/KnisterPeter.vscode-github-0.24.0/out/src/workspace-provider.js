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
Object.defineProperty(exports, "__esModule", { value: true });
const tsdi_1 = require("tsdi");
const vscode = require("vscode");
let WorkspaceProvider = class WorkspaceProvider {
    init() {
        vscode.workspace.onDidChangeTextDocument(() => this.updateWorkspace());
        vscode.workspace.onDidChangeWorkspaceFolders(() => this.updateWorkspace());
        vscode.workspace.onDidCloseTextDocument(() => this.updateWorkspace());
        vscode.workspace.onDidOpenTextDocument(() => this.updateWorkspace());
        this.updateWorkspace();
    }
    updateWorkspace() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !vscode.workspace.workspaceFolders) {
            this.folder = undefined;
            return;
        }
        this.folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    }
};
__decorate([
    tsdi_1.initialize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkspaceProvider.prototype, "init", null);
WorkspaceProvider = __decorate([
    tsdi_1.component
], WorkspaceProvider);
exports.WorkspaceProvider = WorkspaceProvider;
//# sourceMappingURL=workspace-provider.js.map