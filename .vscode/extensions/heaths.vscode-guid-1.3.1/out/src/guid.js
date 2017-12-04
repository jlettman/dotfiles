"use strict";
var node_uuid_1 = require('node-uuid');
var util = require('util');
/**
 * A globally unique identifier.
 */
var Guid = (function () {
    /**
     * Creates a new globally unique identifier.
     */
    function Guid() {
        this._buffer = new Buffer(16);
        this._buffer = node_uuid_1.v4(null, this._buffer);
    }
    /**
     * Parses a string representing a globally unique identifier.
     * @param input A string representing a globally unique identifier.
     * @returns The parsed globally unique identifier.
     */
    Guid.parse = function (input) {
        var guid = new Guid();
        guid._buffer = node_uuid_1.parse(input, guid._buffer);
        return guid;
    };
    /**
     * Returns the raw _buffer.
     * @returns The raw _buffer.
     */
    Guid.prototype.toBuffer = function () {
        return this._buffer;
    };
    /**
     * Returns the string representation of a globally unique identifier.
     * @param format Optional format specifier: 'struct' ('x'), 'braced' ('b'), or other (default).
     * @returns The string representation of a globally unique identifier.
     */
    Guid.prototype.toString = function (format) {
        if (format === 'struct' || format === 'x') {
            var b = this._buffer;
            return util.format('{0x%s, 0x%s, 0x%s, {0x%s, 0x%s, 0x%s, 0x%s, 0x%s, 0x%s, 0x%s, 0x%s}}', b.toString('hex', 0, 4), b.toString('hex', 4, 6), b.toString('hex', 6, 8), b.toString('hex', 8, 9), b.toString('hex', 9, 10), b.toString('hex', 10, 11), b.toString('hex', 11, 12), b.toString('hex', 12, 13), b.toString('hex', 13, 14), b.toString('hex', 14, 15), b.toString('hex', 15, 16));
        }
        else if (format === 'braced' || format === 'b') {
            return util.format('{%s}', this.toString());
        }
        else if (format === 'no-hyphen') {
            return this.toString().replace(/-/g, '');
        }
        else {
            return node_uuid_1.unparse(this._buffer);
        }
    };
    /**
     * Gets an identifier consisting of all zeroes.
     */
    Guid.EMPTY = Guid.parse('0');
    return Guid;
}());
exports.Guid = Guid;

//# sourceMappingURL=guid.js.map
