"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function run(cmd, args, output) {
    return new Promise((resolve) => {
        const p = child_process_1.spawn(cmd, args);
        p.stdout.on('data', output);
        p.stderr.on('data', output);
        p.on('close', resolve);
    });
}
exports.run = run;
;
//# sourceMappingURL=run.js.map