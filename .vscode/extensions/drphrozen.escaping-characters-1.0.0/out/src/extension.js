'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const escaper_1 = require('./escaper');
let commands = [
    { id: 'extension.escapeHex', mode: escaper_1.MODE.EscapeHex },
    { id: 'extension.escapeOctal', mode: escaper_1.MODE.EscapeOctal },
    { id: 'extension.escapeUnicode', mode: escaper_1.MODE.EscapeUnicode },
    { id: 'extension.escapeUnicodeES6', mode: escaper_1.MODE.EscapeUnicodeES6 },
    { id: 'extension.unescapeAll', mode: escaper_1.MODE.UnescapeAll },
    { id: 'extension.unescapeHex', mode: escaper_1.MODE.UnescapeHex },
    { id: 'extension.unescapeOctal', mode: escaper_1.MODE.UnescapeOctal },
    { id: 'extension.unescapeUnicode', mode: escaper_1.MODE.UnescapeUnicode }
];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "escaping-characters" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let escaper = new escaper_1.Escaper();
    context.subscriptions.push(escaper);
    commands.forEach(command => {
        let textEditorCommand = vscode.commands.registerTextEditorCommand(command.id, (editor, edit) => {
            escaper.process(editor, command.mode);
        });
        context.subscriptions.push(textEditorCommand);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map