"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var source_map_1 = require("source-map");
var PathUtils = require("./pathUtilities");
var util = require('../node_modules/source-map/lib/util.js');
var Bias;
(function (Bias) {
    Bias[Bias["GREATEST_LOWER_BOUND"] = 1] = "GREATEST_LOWER_BOUND";
    Bias[Bias["LEAST_UPPER_BOUND"] = 2] = "LEAST_UPPER_BOUND";
})(Bias = exports.Bias || (exports.Bias = {}));
var SourceMaps = (function () {
    function SourceMaps(generatedCodeDirectory) {
        this._allSourceMaps = {};
        this._generatedToSourceMaps = {};
        this._sourceToGeneratedMaps = {};
        this._generatedCodeDirectory = generatedCodeDirectory;
    }
    SourceMaps.prototype.MapPathFromSource = function (pathToSource) {
        var map = this._findSourceToGeneratedMapping(pathToSource);
        if (map)
            return map;
        return null;
    };
    SourceMaps.prototype.MapFromSource = function (pathToSource, line, column, bias) {
        var map = this._findSourceToGeneratedMapping(pathToSource);
        if (map) {
            var mr = map.generatedPositionFor(pathToSource, line, column, bias);
            if (mr && typeof mr.line === 'number') {
                return {
                    path: map.generatedPath(),
                    line: mr.line,
                    column: mr.column
                };
            }
        }
        return null;
    };
    SourceMaps.prototype.MapToSource = function (pathToGenerated, line, column, bias) {
        var map = this._findGeneratedToSourceMapping(pathToGenerated);
        if (map) {
            var mr = map.originalPositionFor(line, column, bias);
            if (mr && mr.source) {
                return {
                    path: mr.source,
                    content: mr.content,
                    line: mr.line,
                    column: mr.column
                };
            }
        }
        return null;
    };
    SourceMaps.prototype._findSourceToGeneratedMapping = function (pathToSource) {
        if (!pathToSource) {
            return null;
        }
        if (pathToSource in this._sourceToGeneratedMaps) {
            return this._sourceToGeneratedMaps[pathToSource];
        }
        for (var key in this._generatedToSourceMaps) {
            var m = this._generatedToSourceMaps[key];
            if (m.doesOriginateFrom(pathToSource)) {
                this._sourceToGeneratedMaps[pathToSource] = m;
                return m;
            }
        }
        if (this._generatedCodeDirectory) {
            try {
                var maps = FS.readdirSync(this._generatedCodeDirectory).filter(function (e) { return Path.extname(e.toLowerCase()) === '.map'; });
                for (var _i = 0, maps_1 = maps; _i < maps_1.length; _i++) {
                    var map_name = maps_1[_i];
                    var map_path = Path.join(this._generatedCodeDirectory, map_name);
                    var m = this._loadSourceMap(map_path);
                    if (m && m.doesOriginateFrom(pathToSource)) {
                        this._sourceToGeneratedMaps[pathToSource] = m;
                        return m;
                    }
                }
            }
            catch (e) {
            }
        }
        var pathToGenerated = pathToSource;
        var ext = Path.extname(pathToSource);
        if (ext !== '.js') {
            var pos = pathToSource.lastIndexOf('.');
            if (pos >= 0) {
                pathToGenerated = pathToSource.substr(0, pos) + '.js';
            }
        }
        var map = null;
        if (this._generatedCodeDirectory) {
            var rest = PathUtils.makeRelative(this._generatedCodeDirectory, pathToGenerated);
            while (rest) {
                var path = Path.join(this._generatedCodeDirectory, rest);
                map = this._findGeneratedToSourceMapping(path);
                if (map) {
                    break;
                }
                rest = PathUtils.removeFirstSegment(rest);
            }
        }
        if (map === null) {
            var srcSegment = Path.sep + 'src' + Path.sep;
            if (pathToGenerated.indexOf(srcSegment) >= 0) {
                var outSegment = Path.sep + 'out' + Path.sep;
                pathToGenerated = pathToGenerated.replace(srcSegment, outSegment);
                map = this._findGeneratedToSourceMapping(pathToGenerated);
            }
        }
        if (map === null && pathToGenerated !== pathToSource) {
            map = this._findGeneratedToSourceMapping(pathToGenerated);
        }
        if (map) {
            this._sourceToGeneratedMaps[pathToSource] = map;
            return map;
        }
        return null;
    };
    SourceMaps.prototype._findGeneratedToSourceMapping = function (pathToGenerated) {
        if (!pathToGenerated) {
            return null;
        }
        if (pathToGenerated in this._generatedToSourceMaps) {
            return this._generatedToSourceMaps[pathToGenerated];
        }
        var map_path = null;
        var uri = this._findSourceMapUrlInFile(pathToGenerated);
        if (uri) {
            if (uri.indexOf("data:application/json") >= 0) {
                var pos = uri.lastIndexOf(',');
                if (pos > 0) {
                    var data = uri.substr(pos + 1);
                    try {
                        var buffer = new Buffer(data, 'base64');
                        var json = buffer.toString();
                        if (json) {
                            return this._registerSourceMap(new SourceMap(pathToGenerated, pathToGenerated, json));
                        }
                    }
                    catch (e) {
                    }
                }
            }
            else {
                map_path = uri;
            }
        }
        if (map_path && !Path.isAbsolute(map_path)) {
            map_path = PathUtils.makePathAbsolute(pathToGenerated, map_path);
        }
        if (!map_path || !FS.existsSync(map_path)) {
            map_path = pathToGenerated + '.map';
        }
        if (map_path && FS.existsSync(map_path)) {
            var map = this._loadSourceMap(map_path, pathToGenerated);
            if (map) {
                return map;
            }
        }
        return null;
    };
    SourceMaps.prototype._findSourceMapUrlInFile = function (pathToGenerated) {
        try {
            var contents = FS.readFileSync(pathToGenerated).toString();
            var lines = contents.split('\n');
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                var matches = SourceMaps.SOURCE_MAPPING_MATCHER.exec(line);
                if (matches && matches.length === 2) {
                    var uri = matches[1].trim();
                    return uri;
                }
            }
        }
        catch (e) {
        }
        return null;
    };
    SourceMaps.prototype._loadSourceMap = function (map_path, generatedPath) {
        if (map_path in this._allSourceMaps) {
            return this._allSourceMaps[map_path];
        }
        try {
            var mp = Path.join(map_path);
            var contents = FS.readFileSync(mp).toString();
            var map = new SourceMap(mp, generatedPath, contents);
            this._allSourceMaps[map_path] = map;
            this._registerSourceMap(map);
            return map;
        }
        catch (e) {
        }
        return null;
    };
    SourceMaps.prototype._registerSourceMap = function (map) {
        var gp = map.generatedPath();
        if (gp) {
            this._generatedToSourceMaps[gp] = map;
        }
        return map;
    };
    return SourceMaps;
}());
SourceMaps.SOURCE_MAPPING_MATCHER = new RegExp("//[#@] ?sourceMappingURL=(.+)$");
exports.SourceMaps = SourceMaps;
var SourceMap = (function () {
    function SourceMap(mapPath, generatedPath, json) {
        var _this = this;
        this._sourcemapLocation = this.toUrl(Path.dirname(mapPath));
        var sm = JSON.parse(json);
        if (!generatedPath) {
            var file = sm.file;
            if (!PathUtils.isAbsolutePath(file)) {
                generatedPath = PathUtils.makePathAbsolute(mapPath, file);
            }
        }
        this._generatedFile = generatedPath;
        sm.sourceRoot = this.toUrl(sm.sourceRoot, '');
        for (var i = 0; i < sm.sources.length; i++) {
            sm.sources[i] = this.toUrl(sm.sources[i]);
        }
        this._sourceRoot = sm.sourceRoot;
        this._sources = sm.sources
            .map(util.normalize)
            .map(function (source) {
            return _this._sourceRoot && util.isAbsolute(_this._sourceRoot) && util.isAbsolute(source)
                ? util.relative(_this._sourceRoot, source)
                : source;
        });
        try {
            this._smc = new source_map_1.SourceMapConsumer(sm);
        }
        catch (e) {
        }
    }
    SourceMap.prototype.toUrl = function (path, dflt) {
        if (path) {
            path = path.replace(/\\/g, '/');
            if (/^[a-zA-Z]\:\//.test(path)) {
                path = 'file:///' + path;
            }
            if (/^file\:\/\/\/[A-Z]\:\//.test(path)) {
                var dl = path[8];
                path = path.replace(dl, dl.toLowerCase());
            }
            return path;
        }
        return dflt;
    };
    SourceMap.prototype.generatedPath = function () {
        return this._generatedFile;
    };
    SourceMap.prototype.doesOriginateFrom = function (absPath) {
        return this.findSource(absPath) !== null;
    };
    SourceMap.prototype.findSource = function (absPath) {
        if (process.platform === 'win32') {
            absPath = absPath.replace(/\\/g, '/');
        }
        for (var _i = 0, _a = this._sources; _i < _a.length; _i++) {
            var name_1 = _a[_i];
            if (!util.isAbsolute(name_1)) {
                name_1 = util.join(this._sourceRoot, name_1);
            }
            var url = this.absolutePath(name_1);
            if (absPath === url) {
                return name_1;
            }
        }
        return null;
    };
    SourceMap.prototype.absolutePath = function (path) {
        if (!util.isAbsolute(path)) {
            path = util.join(this._sourcemapLocation, path);
        }
        var prefix = 'file://';
        if (path.indexOf(prefix) === 0) {
            path = path.substr(prefix.length);
            if (/^\/[a-zA-Z]\:\//.test(path)) {
                path = path.substr(1);
            }
        }
        return path;
    };
    SourceMap.prototype.originalPositionFor = function (line, column, bias) {
        if (!this._smc) {
            return null;
        }
        var needle = {
            line: line,
            column: column,
            bias: bias || Bias.LEAST_UPPER_BOUND
        };
        var mp = this._smc.originalPositionFor(needle);
        if (mp.source) {
            var src = this._smc.sourceContentFor(mp.source);
            if (src) {
                mp.content = src;
            }
            mp.source = this.absolutePath(mp.source);
            if (process.platform === 'win32') {
                mp.source = mp.source.replace(/\//g, '\\');
            }
        }
        return mp;
    };
    SourceMap.prototype.generatedPositionFor = function (absPath, line, column, bias) {
        if (!this._smc) {
            return null;
        }
        var source = this.findSource(absPath);
        if (source) {
            var needle = {
                source: source,
                line: line,
                column: column,
                bias: bias || Bias.LEAST_UPPER_BOUND
            };
            return this._smc.generatedPositionFor(needle);
        }
        return null;
    };
    return SourceMap;
}());
exports.SourceMap = SourceMap;
