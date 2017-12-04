"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const issuetracker_base_1 = require("./issuetracker-base");
class JiraIssueTracker extends issuetracker_base_1.IssueTrackerBase {
    constructor(cfg) {
        super();
        this.cfg = cfg;
    }
    findIssueUrl(message) {
        for (const projectKey of this.cfg.projectKeys) {
            const match = message.match(`\\b(${projectKey.toUpperCase()}-\\d+)\\b`);
            if (match) {
                return `https://${this.cfg.host}/browse/${match[1]}`;
            }
        }
    }
}
exports.JiraIssueTracker = JiraIssueTracker;
//# sourceMappingURL=issuetracker-jira.js.map