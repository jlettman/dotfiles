/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return a hash value for an object.
 */
function hash(obj, hashVal) {
    if (hashVal === void 0) { hashVal = 0; }
    switch (typeof obj) {
        case 'object':
            if (obj === null) {
                return numberHash(349, hashVal);
            }
            else if (Array.isArray(obj)) {
                return arrayHash(obj, hashVal);
            }
            return objectHash(obj, hashVal);
        case 'string':
            return stringHash(obj, hashVal);
        case 'boolean':
            return booleanHash(obj, hashVal);
        case 'number':
            return numberHash(obj, hashVal);
        case 'undefined':
            return numberHash(obj, 937);
        default:
            return numberHash(obj, 617);
    }
}
exports.hash = hash;
function numberHash(val, initialHashVal) {
    return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
}
function booleanHash(b, initialHashVal) {
    return numberHash(b ? 433 : 863, initialHashVal);
}
function stringHash(s, hashVal) {
    hashVal = numberHash(149417, hashVal);
    for (var i = 0, length = s.length; i < length; i++) {
        hashVal = numberHash(s.charCodeAt(i), hashVal);
    }
    return hashVal;
}
function arrayHash(arr, initialHashVal) {
    initialHashVal = numberHash(104579, initialHashVal);
    return arr.reduce(function (hashVal, item) { return hash(item, hashVal); }, initialHashVal);
}
function objectHash(obj, initialHashVal) {
    initialHashVal = numberHash(181387, initialHashVal);
    return Object.keys(obj).sort().reduce(function (hashVal, key) {
        hashVal = stringHash(key, hashVal);
        return hash(obj[key], hashVal);
    }, initialHashVal);
}
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/dcee2202709a4f223185514b9275aa4229841aa7/extensions/json/client/out/utils/hash.js.map