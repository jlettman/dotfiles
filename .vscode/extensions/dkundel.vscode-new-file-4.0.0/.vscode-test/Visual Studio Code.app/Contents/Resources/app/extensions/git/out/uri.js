/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function fromGitUri(uri) {
    return JSON.parse(uri.query);
}
exports.fromGitUri = fromGitUri;
// As a mitigation for extensions like ESLint showing warnings and errors
// for git URIs, let's change the file extension of these uris to .git,
// when `replaceFileExtension` is true.
function toGitUri(uri, ref, replaceFileExtension = false) {
    return uri.with({
        scheme: 'git',
        path: replaceFileExtension ? `${uri.path}.git` : uri.path,
        query: JSON.stringify({
            path: uri.fsPath,
            ref
        })
    });
}
exports.toGitUri = toGitUri;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/dcee2202709a4f223185514b9275aa4229841aa7/extensions/git/out/uri.js.map