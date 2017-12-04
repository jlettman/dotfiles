"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function eventToPromise(stream, evname) {
    return new Promise((resolve) => {
        stream.on(evname, resolve);
    });
}
exports.eventToPromise = eventToPromise;
function readJson(file, def, forceCreate) {
    var obj = null;
    try {
        obj = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch (e) {
        if (!forceCreate)
            return null;
    }
    if (def) {
        var modified = false;
        if (!(obj instanceof Object)) {
            obj = {};
            modified = true;
        }
        for (const p in def) {
            if (p in obj)
                continue;
            obj[p] = def[p];
            modified = true;
        }
        if (forceCreate && modified)
            writeJson(file, obj);
    }
    return obj;
}
exports.readJson = readJson;
function writeJson(file, obj) {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8');
}
exports.writeJson = writeJson;
function mkdir(dirPath) {
    try {
        return fs.mkdirSync(dirPath);
    }
    catch (error) {
        switch (error.code) {
            case 'ENOENT':
                mkdir(path.dirname(dirPath));
                return fs.mkdirSync(dirPath);
            case 'EEXIST':
                return;
        }
        throw error;
    }
}
exports.mkdir = mkdir;
function writeTo(filename, fos) {
    const read = fs.createReadStream(filename);
    read.pipe(fos, { end: false });
    return eventToPromise(read, 'end');
}
exports.writeTo = writeTo;
function copy(from, to) {
    const fos = fs.createWriteStream(to);
    fs.createReadStream(from).pipe(fos);
    return eventToPromise(fos, 'close');
}
exports.copy = copy;
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
exports.readFile = readFile;
function exists(path) {
    return new Promise(resolve => fs.exists(path, resolve));
}
exports.exists = exists;
//# sourceMappingURL=nfs.js.map