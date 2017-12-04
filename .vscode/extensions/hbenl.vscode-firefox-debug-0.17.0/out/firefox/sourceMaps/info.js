"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const source_map_1 = require("source-map");
let LEAST_UPPER_BOUND = source_map_1.SourceMapConsumer.LEAST_UPPER_BOUND;
let GREATEST_LOWER_BOUND = source_map_1.SourceMapConsumer.GREATEST_LOWER_BOUND;
class SourceMappingInfo {
    constructor(sources, underlyingSource, sourceMapUri, sourceMapConsumer) {
        this.sources = sources;
        this.underlyingSource = underlyingSource;
        this.sourceMapUri = sourceMapUri;
        this.sourceMapConsumer = sourceMapConsumer;
    }
    generatedLocationFor(originalLocation) {
        if (!this.sourceMapConsumer) {
            return { line: originalLocation.line, column: originalLocation.column };
        }
        let consumerArgs = Object.assign({ bias: LEAST_UPPER_BOUND }, originalLocation);
        let generatedLocation = this.sourceMapConsumer.generatedPositionFor(consumerArgs);
        if (generatedLocation.line === null) {
            consumerArgs.bias = GREATEST_LOWER_BOUND;
            generatedLocation = this.sourceMapConsumer.generatedPositionFor(consumerArgs);
        }
        return { line: generatedLocation.line || 0, column: generatedLocation.column || 0 };
    }
    originalLocationFor(generatedLocation) {
        if (!this.sourceMapConsumer) {
            return Object.assign({ source: this.sources[0].url }, generatedLocation);
        }
        let consumerArgs = Object.assign({ bias: LEAST_UPPER_BOUND }, generatedLocation);
        let originalLocation = this.sourceMapConsumer.originalPositionFor(consumerArgs);
        if (originalLocation.line === null) {
            consumerArgs.bias = GREATEST_LOWER_BOUND;
            originalLocation = this.sourceMapConsumer.originalPositionFor(consumerArgs);
        }
        return {
            source: originalLocation.source || this.sources[0].url,
            line: originalLocation.line || 0,
            column: originalLocation.column || 0
        };
    }
    syncBlackboxFlag() {
        if ((this.sources.length === 1) && (this.sources[0] === this.underlyingSource)) {
            return;
        }
        let blackboxUnderlyingSource = this.sources.every((source) => source.source.isBlackBoxed);
        if (this.underlyingSource.source.isBlackBoxed !== blackboxUnderlyingSource) {
            this.underlyingSource.setBlackbox(blackboxUnderlyingSource);
        }
    }
    disposeSource(source) {
        let sourceIndex = this.sources.indexOf(source);
        if (sourceIndex >= 0) {
            this.sources.splice(sourceIndex, 1);
            if (this.sources.length === 0) {
                this.underlyingSource.dispose();
            }
        }
    }
}
exports.SourceMappingInfo = SourceMappingInfo;
//# sourceMappingURL=info.js.map