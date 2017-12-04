// The MIT License (MIT)
//
// Copyright (c) Heath Stewart
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
"use strict";
var vscode = require('vscode');
var util = require('util');
var guid_1 = require('./guid');
var FormatType;
(function (FormatType) {
    FormatType[FormatType["LOWERCASE"] = 0] = "LOWERCASE";
    FormatType[FormatType["UPPERCASE"] = 1] = "UPPERCASE";
    FormatType[FormatType["SNIPPET"] = 2] = "SNIPPET";
})(FormatType || (FormatType = {}));
;
var GuidPickItem = (function () {
    function GuidPickItem(index, guid, format) {
        this._index = index;
        this._guid = guid;
        this._format = format;
    }
    Object.defineProperty(GuidPickItem.prototype, "label", {
        get: function () {
            return this._index.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GuidPickItem.prototype, "description", {
        get: function () {
            return this._format.format(this._guid);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GuidPickItem.prototype, "text", {
        get: function () {
            var s = '';
            if (typeof this._format.preface === 'function') {
                s = this._format.preface(this._guid);
            }
            s += this._format.format(this._guid);
            if (typeof this._format.epilogue === 'function') {
                s += this._format.epilogue(this._guid);
            }
            return s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GuidPickItem.prototype, "named", {
        get: function () {
            return this._format.named || false;
        },
        enumerable: true,
        configurable: true
    });
    return GuidPickItem;
}());
/**
 * Extension commands for working with GUIDs.
 */
var GuidCommands = (function () {
    function GuidCommands() {
    }
    /**
     * Inserts GUID at the cursor position or replaces active selection.
     * @param textEditor {vscode.TextEditor} The active text editor.
     * @param edit {vscode.TextEditorEdit} A text edit builder for the intended change.
     */
    GuidCommands.insertCommand = function (textEditor, edit) {
        var g = new guid_1.Guid();
        var settings = vscode.workspace.getConfiguration('insertGuid');
        var showLowercase = settings.get('showLowercase');
        var showUppercase = settings.get('showUppercase');
        var showCodeSnippets = settings.get('showCodeSnippets');
        var items = GuidCommands.getQuickPickItems(g, showLowercase, showUppercase, showCodeSnippets);
        // Prompt the user for a format.
        vscode.window.showQuickPick(items)
            .then(function (item) {
            if (typeof item === 'undefined') {
                // Selection canceled.
                return;
            }
            // 'edit' no longer valid so start a new edit.
            textEditor.edit(function (edit) {
                for (var _i = 0, _a = textEditor.selections; _i < _a.length; _i++) {
                    var selection = _a[_i];
                    if (selection.isEmpty) {
                        edit.insert(selection.start, item.text);
                    }
                    else {
                        edit.replace(selection, item.text);
                    }
                }
                if (item.named) {
                }
            });
        });
    };
    /**
     * Gets an array of items to display in the Quick Pick window.
     * @param guid The GUID to render in each Quick Pick item.
     * @param showLowercase Indicates whether lowercase options should be included in the array.
     * @param showUppercase Indicates whether uppercase options should be included in the array.
     * @param showCodeSnippets Indicates whether code snippet options should be included in the array.
     * @returns An array of items to display in the Quick Pick window.
     */
    GuidCommands.getQuickPickItems = function (guid, showLowercase, showUppercase, showCodeSnippets) {
        var items = [];
        var nextIndex = 0;
        for (var _i = 0, _a = GuidCommands._formats; _i < _a.length; _i++) {
            var format = _a[_i];
            if (((showLowercase || (!showUppercase && !showCodeSnippets)) && format.type == FormatType.LOWERCASE) ||
                (showUppercase && format.type == FormatType.UPPERCASE) ||
                (showCodeSnippets && format.type == FormatType.SNIPPET)) {
                var item = new GuidPickItem(++nextIndex, guid, format);
                items.push(item);
            }
        }
        return items;
    };
    // Use placeholder token that completely selects with double click.
    GuidCommands._NAME = '__NAME__';
    GuidCommands._formats = [
        {
            format: function (g) {
                return g.toString();
            },
            type: FormatType.LOWERCASE
        },
        {
            format: function (g) {
                return g.toString('braced');
            },
            type: FormatType.LOWERCASE
        },
        {
            format: function (g) {
                return g.toString().toUpperCase();
            },
            type: FormatType.UPPERCASE
        },
        {
            format: function (g) {
                return g.toString('braced').toUpperCase();
            },
            type: FormatType.UPPERCASE
        },
        {
            named: true,
            format: function (g) {
                return util.format('static const struct GUID %s = %s;', GuidCommands._NAME, g.toString('struct'));
            },
            preface: function (g) {
                return util.format('// %s\n', g.toString('braced'));
            },
            epilogue: function (g) {
                return '\n';
            },
            type: FormatType.SNIPPET
        },
        {
            named: true,
            format: function (g) {
                return util.format('DEFINE_GUID(%s, %s);', GuidCommands._NAME, g.toString('struct').replace(/[\{\}]/g, ''));
            },
            preface: function (g) {
                return util.format('// %s\n', g.toString('braced'));
            },
            epilogue: function (g) {
                return '\n';
            },
            type: FormatType.SNIPPET
        },
        {
            format: function (g) {
                return g.toString('no-hyphen');
            },
            type: FormatType.LOWERCASE
        },
        {
            format: function (g) {
                return g.toString('no-hyphen').toUpperCase();
            },
            type: FormatType.UPPERCASE
        }
    ];
    return GuidCommands;
}());
exports.GuidCommands = GuidCommands;

//# sourceMappingURL=commands.js.map
