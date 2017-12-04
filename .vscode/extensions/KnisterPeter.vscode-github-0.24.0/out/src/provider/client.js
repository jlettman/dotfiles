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
const client_1 = require("./github/client");
const client_2 = require("./gitlab/client");
function createClient(git, tokens, uri, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitProtocol = yield git.getGitProtocol(uri);
        const protocol = gitProtocol.startsWith('http') ? gitProtocol : 'https:';
        const hostname = yield git.getGitHostname(uri);
        const tokenInfo = tokens[hostname];
        if (!tokenInfo) {
            throw new Error('No token');
        }
        switch (tokenInfo.provider) {
            case 'github':
                return new client_1.GithubClient(protocol, hostname, tokens[hostname].token, logger);
            case 'gitlab':
                return new client_2.GitLabClient(protocol, hostname, tokens[hostname].token, logger);
            default:
                throw new Error(`Unknown git provider '${tokenInfo.provider}'`);
        }
    });
}
exports.createClient = createClient;
//# sourceMappingURL=client.js.map