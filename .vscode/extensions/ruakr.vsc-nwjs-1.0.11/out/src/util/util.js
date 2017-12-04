"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function override(target, from) {
    if (from instanceof Array) {
        return from;
    }
    if (from instanceof Object) {
        if ((target instanceof Array) || !(target instanceof Object))
            return from;
        else {
            for (const p in from) {
                target[p] = override(target[p], from[p]);
            }
            return target;
        }
    }
    return from;
}
exports.override = override;
//# sourceMappingURL=util.js.map