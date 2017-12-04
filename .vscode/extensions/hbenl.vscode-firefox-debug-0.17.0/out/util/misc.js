"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const FirefoxProfile = require("firefox-profile");
function concatArrays(arrays) {
    return [].concat.apply([], arrays);
}
exports.concatArrays = concatArrays;
function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
exports.delay = delay;
function isWindowsPlatform() {
    return (os.platform() === 'win32');
}
exports.isWindowsPlatform = isWindowsPlatform;
function exceptionGripToString(grip) {
    if ((typeof grip === 'object') && (grip !== null) && (grip.type === 'object')) {
        let preview = grip.preview;
        if (preview && (preview.kind === 'Error')) {
            if (preview.name === 'ReferenceError') {
                return 'not available';
            }
            let str = (preview.name !== undefined) ? (preview.name + ': ') : '';
            str += (preview.message !== undefined) ? preview.message : '';
            if (str !== '') {
                return str;
            }
        }
    }
    else if (typeof grip === 'string') {
        return grip;
    }
    return 'unknown error';
}
exports.exceptionGripToString = exceptionGripToString;
const identifierExpression = /^[a-zA-Z_$][a-zA-Z_$]*$/;
function accessorExpression(objectExpression, propertyName) {
    if (objectExpression === undefined) {
        return undefined;
    }
    else if (objectExpression === '') {
        return propertyName;
    }
    else if (identifierExpression.test(propertyName)) {
        return `${objectExpression}.${propertyName}`;
    }
    else {
        const escapedPropertyName = propertyName.replace('\\', '\\\\').replace('\'', '\\\'');
        return `${objectExpression}['${escapedPropertyName}']`;
    }
}
exports.accessorExpression = accessorExpression;
function findAddonId(addonPath) {
    return new Promise((resolve, reject) => {
        var dummyProfile = new FirefoxProfile();
        dummyProfile._addonDetails(addonPath, (addonDetails) => {
            if (typeof addonDetails.id === 'string') {
                resolve(addonDetails.id);
            }
            else {
                reject('This debugger currently requires add-ons to specify an ID in their manifest');
            }
            dummyProfile.deleteDir(() => { });
        });
    });
}
exports.findAddonId = findAddonId;
//# sourceMappingURL=misc.js.map