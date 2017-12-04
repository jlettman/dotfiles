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
const command_base_1 = require("./command-base");
class OpenInIssueTrackerCommand extends command_base_1.CommandBase {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const backend = yield this.getBackend();
            const filePath = this.getFilePath(backend.root);
            const rev = yield backend.findSelectedRevision(filePath, this.getCurrentLine());
            const message = yield backend.getRevisionMessage(rev);
            const issueTrackers = yield this.getIssueTrackers();
            const issueUrls = issueTrackers.map(tracker => tracker.findIssueUrl(message)).filter(isDefined);
            if (issueUrls.length === 0) {
                throw new error_1.CodeBucketError('Unable to find any matching issue keys.');
            }
            this.openUrl(issueUrls[0]);
        });
    }
}
exports.OpenInIssueTrackerCommand = OpenInIssueTrackerCommand;
function isDefined(str) {
    return str !== undefined && str.length > 0;
}
//# sourceMappingURL=command-open-issue.js.map