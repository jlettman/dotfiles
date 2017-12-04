"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const log_1 = require("./log");
const misc_1 = require("./misc");
let log = log_1.Log.create('PathConversion');
let isWindowsPlatform = misc_1.isWindowsPlatform();
exports.urlDetector = /^[a-zA-Z][a-zA-Z0-9\+\-\.]*\:\/\//;
class PathMapper {
    constructor(pathMappings, addonConfig) {
        this.pathMappings = pathMappings;
        this.addonConfig = addonConfig;
    }
    convertFirefoxSourceToPath(source) {
        if (!source)
            return undefined;
        if (source.addonID && this.addonConfig && (source.addonID === this.addonConfig.id)) {
            let sourcePath = this.removeQueryString(path.join(this.addonConfig.path, source.addonPath));
            log.debug(`Addon script path: ${sourcePath}`);
            return sourcePath;
        }
        else if (source.isSourceMapped && source.generatedUrl && source.url && !exports.urlDetector.test(source.url)) {
            let originalPath = source.url;
            if (path.isAbsolute(originalPath)) {
                log.debug(`Sourcemapped absolute path: ${originalPath}`);
                if (isWindowsPlatform) {
                    originalPath = this.sanitizeWindowsPath(originalPath);
                }
                return originalPath;
            }
            else {
                let generatedPath = this.convertFirefoxUrlToPath(source.generatedUrl);
                if (!generatedPath)
                    return undefined;
                let sourcePath = this.removeQueryString(path.join(path.dirname(generatedPath), originalPath));
                log.debug(`Sourcemapped path: ${sourcePath}`);
                return sourcePath;
            }
        }
        else if (source.url) {
            return this.convertFirefoxUrlToPath(source.url);
        }
        else {
            return undefined;
        }
    }
    convertFirefoxUrlToPath(url) {
        for (var i = 0; i < this.pathMappings.length; i++) {
            let { url: from, path: to } = this.pathMappings[i];
            if (typeof from === 'string') {
                if (url.substr(0, from.length) === from) {
                    if (to === null) {
                        log.debug(`Url ${url} not converted to path`);
                        return undefined;
                    }
                    let path = this.removeQueryString(to + url.substr(from.length));
                    if (isWindowsPlatform) {
                        path = this.sanitizeWindowsPath(path);
                    }
                    log.debug(`Converted url ${url} to path ${path}`);
                    return path;
                }
            }
            else {
                let match = from.exec(url);
                if (match) {
                    if (to === null) {
                        log.debug(`Url ${url} not converted to path`);
                        return undefined;
                    }
                    let path = this.removeQueryString(to + match[1]);
                    if (isWindowsPlatform) {
                        path = this.sanitizeWindowsPath(path);
                    }
                    log.debug(`Converted url ${url} to path ${path}`);
                    return path;
                }
            }
        }
        log.info(`Can't convert url ${url} to path`);
        return undefined;
    }
    removeQueryString(path) {
        let queryStringIndex = path.indexOf('?');
        if (queryStringIndex >= 0) {
            return path.substr(0, queryStringIndex);
        }
        else {
            return path;
        }
    }
    sanitizeWindowsPath(aPath) {
        aPath = path.normalize(aPath);
        aPath = aPath[0].toLowerCase() + aPath.substr(1);
        return aPath;
    }
}
exports.PathMapper = PathMapper;
//# sourceMappingURL=pathMapper.js.map