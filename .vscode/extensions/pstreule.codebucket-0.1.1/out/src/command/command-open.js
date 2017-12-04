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
const path = require("path");
const command_base_1 = require("./command-base");
class OpenInBitbucketCommand extends command_base_1.CommandBase {
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const backend = yield this.getBackend();
            const remote = yield backend.findBitbucketRemote();
            const rev = yield backend.findCurrentRevision();
            const filePath = this.getFilePath(backend.root);
            const ranges = this.getLineRanges().join(',');
            const hash = `${path.basename(filePath)}-${ranges}`;
            const url = `https://${remote.host}/${remote.repo}/src/${rev}/${filePath}#${hash}`;
            this.openUrl(url);
        });
    }
}
exports.OpenInBitbucketCommand = OpenInBitbucketCommand;
//# sourceMappingURL=command-open.js.map