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
const settings_1 = require("../settings");
const shell_1 = require("../shell");
class Backend {
    constructor(root) {
        this.root = root;
        this.shell = new shell_1.Shell(root);
    }
    /**
     * Get a regex match of the first remote containing a Bitbucket host.
     */
    findBitbucketRemote() {
        return __awaiter(this, void 0, void 0, function* () {
            const remotes = yield this.getRemoteList();
            const hosts = settings_1.bitbucketHosts();
            for (const host of hosts) {
                const pattern = new RegExp(`^(\\w+)\\s.*(${host})[:/]([\\w\.\-]+/[\\w\.\-]+)(?:\.git)`);
                for (const remote of remotes) {
                    const matches = pattern.exec(remote);
                    if (matches) {
                        return {
                            name: matches[1],
                            host: matches[2],
                            repo: matches[3]
                        };
                    }
                }
            }
            throw new error_1.CodeBucketError(`Unable to find a remote matching: ${hosts}`);
        });
    }
}
exports.Backend = Backend;
//# sourceMappingURL=backend-base.js.map