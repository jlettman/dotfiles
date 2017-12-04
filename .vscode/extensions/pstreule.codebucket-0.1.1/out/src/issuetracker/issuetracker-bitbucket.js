"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const issuetracker_base_1 = require("./issuetracker-base");
class BitbucketIssueTracker extends issuetracker_base_1.IssueTrackerBase {
    constructor(remote) {
        super();
        this.remote = remote;
    }
    findIssueUrl(message) {
        const match = message.match(/\b\#(\d+)\b/);
        if (match) {
            return `https://${this.remote.host}/${this.remote.repo}/issues/${match[1]}`;
        }
    }
}
exports.BitbucketIssueTracker = BitbucketIssueTracker;
//# sourceMappingURL=issuetracker-bitbucket.js.map