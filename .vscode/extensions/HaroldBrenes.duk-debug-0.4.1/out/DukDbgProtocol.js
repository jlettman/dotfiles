"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EE = require("events");
var assert = require("assert");
var Promise = require("bluebird");
var Duk = require("./DukBase");
var MSG_TRACING = true;
var LOG_STATUS_NOTIFY = false;
var DukEndianness;
(function (DukEndianness) {
    DukEndianness[DukEndianness["Little"] = 1] = "Little";
    DukEndianness[DukEndianness["Mixed"] = 2] = "Mixed";
    DukEndianness[DukEndianness["Big"] = 3] = "Big";
})(DukEndianness = exports.DukEndianness || (exports.DukEndianness = {}));
var DukDvalueMsg = (function (_super) {
    __extends(DukDvalueMsg, _super);
    function DukDvalueMsg() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DukDvalueMsg;
}(Array));
exports.DukDvalueMsg = DukDvalueMsg;
var DukProtoMessage = (function () {
    function DukProtoMessage(type) {
        this.msgtype = type;
    }
    return DukProtoMessage;
}());
exports.DukProtoMessage = DukProtoMessage;
var DukNotificationMessage = (function (_super) {
    __extends(DukNotificationMessage, _super);
    function DukNotificationMessage(cmd) {
        var _this = _super.call(this, Duk.MsgType.NFY) || this;
        _this.cmd = cmd;
        return _this;
    }
    return DukNotificationMessage;
}(DukProtoMessage));
exports.DukNotificationMessage = DukNotificationMessage;
var DukStatusNotification = (function (_super) {
    __extends(DukStatusNotification, _super);
    function DukStatusNotification(msg) {
        var _this = this;
        assert(msg.length == 8);
        _this = _super.call(this, Duk.NotifyType.STATUS) || this;
        _this.state = msg[2].value;
        _this.filename = msg[3].value;
        _this.funcname = msg[4].value;
        _this.linenumber = msg[5].value;
        _this.pc = msg[6].value;
        return _this;
    }
    return DukStatusNotification;
}(DukNotificationMessage));
exports.DukStatusNotification = DukStatusNotification;
var DukPrintNotification = (function (_super) {
    __extends(DukPrintNotification, _super);
    function DukPrintNotification(msg) {
        var _this = _super.call(this, Duk.NotifyType.PRINT) || this;
        _this.message = msg[2].value;
        return _this;
    }
    return DukPrintNotification;
}(DukNotificationMessage));
exports.DukPrintNotification = DukPrintNotification;
var DukAlertNotification = (function (_super) {
    __extends(DukAlertNotification, _super);
    function DukAlertNotification(msg) {
        var _this = _super.call(this, Duk.NotifyType.ALERT) || this;
        _this.message = msg[2].value;
        return _this;
    }
    return DukAlertNotification;
}(DukNotificationMessage));
exports.DukAlertNotification = DukAlertNotification;
var DukLogNotification = (function (_super) {
    __extends(DukLogNotification, _super);
    function DukLogNotification(msg) {
        var _this = _super.call(this, Duk.NotifyType.LOG) || this;
        _this.level = msg[2].value;
        _this.message = msg[3].value;
        return _this;
    }
    return DukLogNotification;
}(DukNotificationMessage));
exports.DukLogNotification = DukLogNotification;
var DukThrowNotification = (function (_super) {
    __extends(DukThrowNotification, _super);
    function DukThrowNotification(msg) {
        var _this = _super.call(this, Duk.NotifyType.THROW) || this;
        if (msg.length != 7)
            throw new Error("Invalid notification message.");
        _this.fatal = msg[2].value;
        _this.message = msg[3].value;
        _this.fileName = msg[4].value;
        _this.lineNumber = msg[5].value;
        return _this;
    }
    return DukThrowNotification;
}(DukNotificationMessage));
exports.DukThrowNotification = DukThrowNotification;
var DukDetachingNotification = (function (_super) {
    __extends(DukDetachingNotification, _super);
    function DukDetachingNotification() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DukDetachingNotification;
}(DukNotificationMessage));
exports.DukDetachingNotification = DukDetachingNotification;
var DukRequest = (function (_super) {
    __extends(DukRequest, _super);
    function DukRequest(cmd, sequence) {
        var _this = _super.call(this, Duk.MsgType.REQ) || this;
        _this.cmd = cmd;
        _this.sequence = sequence;
        return _this;
    }
    return DukRequest;
}(DukProtoMessage));
exports.DukRequest = DukRequest;
var DukResponse = (function (_super) {
    __extends(DukResponse, _super);
    function DukResponse(cmd) {
        var _this = _super.call(this, Duk.MsgType.REP) || this;
        _this.cmd = cmd;
        return _this;
    }
    return DukResponse;
}(DukProtoMessage));
exports.DukResponse = DukResponse;
var DukBasicInfoResponse = (function (_super) {
    __extends(DukBasicInfoResponse, _super);
    function DukBasicInfoResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.BASICINFO) || this;
        if (msg.length != 7)
            throw new Error("Invalid 'BasicInfo' response message.");
        _this.version = msg[1].value;
        _this.gitDesc = msg[2].value;
        _this.targetInfo = msg[3].value;
        _this.endianness = msg[4].value;
        _this.ptrSize = msg[5].value;
        if (_this.endianness < DukEndianness.Little ||
            _this.endianness > DukEndianness.Big)
            throw new Error("Invalid endianness");
        return _this;
    }
    return DukBasicInfoResponse;
}(DukResponse));
exports.DukBasicInfoResponse = DukBasicInfoResponse;
var DukAddBreakResponse = (function (_super) {
    __extends(DukAddBreakResponse, _super);
    function DukAddBreakResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.ADDBREAK) || this;
        assert(msg.length == 3);
        if (msg[1].type !== Duk.DValKind.int)
            throw new TypeError();
        _this.index = msg[1].value;
        return _this;
    }
    return DukAddBreakResponse;
}(DukResponse));
exports.DukAddBreakResponse = DukAddBreakResponse;
var DukCallStackEntry = (function () {
    function DukCallStackEntry(fileName, funcName, lineNumber, pc) {
        this.fileName = fileName;
        this.funcName = funcName;
        this.lineNumber = lineNumber;
        this.pc = pc;
    }
    return DukCallStackEntry;
}());
exports.DukCallStackEntry = DukCallStackEntry;
var DukGetCallStackResponse = (function (_super) {
    __extends(DukGetCallStackResponse, _super);
    function DukGetCallStackResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.GETCALLSTACK) || this;
        var len = (msg.length - 2);
        if (len == 0) {
            _this.callStack = new DukCallStackEntry[0];
        }
        else {
            assert(len % 4 == 0);
            if (len % 4 != 0)
                throw new Error("Incorrect stack frame values.");
            _this.callStack = new Array();
            _this.callStack.length = len / 4;
            for (var i = 1, j = 0; i < len; i += 4, j++) {
                _this.callStack[j] = new DukCallStackEntry(msg[i].value, msg[i + 1].value, msg[i + 2].value, msg[i + 3].value);
            }
        }
        return _this;
    }
    return DukGetCallStackResponse;
}(DukResponse));
exports.DukGetCallStackResponse = DukGetCallStackResponse;
var DukGetLocalsResponse = (function (_super) {
    __extends(DukGetLocalsResponse, _super);
    function DukGetLocalsResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.GETLOCALS) || this;
        _this.vars = [];
        var len = (msg.length - 2);
        if (len == 0)
            return _this;
        assert(len % 2 == 0);
        if (len % 2 != 0)
            throw new Error("Invalid 'GetLocals' response message.");
        _this.vars.length = len / 2;
        for (var i = 1, j = 0; i < len; i += 2, j++) {
            var name_1 = msg[i].value;
            var val = msg[i + 1].value;
            _this.vars[j] = {
                name: name_1,
                value: val
            };
        }
        return _this;
    }
    return DukGetLocalsResponse;
}(DukResponse));
exports.DukGetLocalsResponse = DukGetLocalsResponse;
var DukListBreakResponse = (function (_super) {
    __extends(DukListBreakResponse, _super);
    function DukListBreakResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.LISTBREAK) || this;
        _this.breakpoints = [];
        var len = (msg.length - 2);
        if (len == 0)
            return _this;
        assert(len % 2 == 0);
        if (len % 2 != 0)
            throw new Error("Invalid 'ListBreakpoints' response message.");
        _this.breakpoints.length = len / 2;
        for (var i = 1, j = 0; i < len; i += 2, j++) {
            _this.breakpoints[j] = {
                fileName: msg[i].value,
                line: msg[i + 1].value
            };
        }
        return _this;
    }
    return DukListBreakResponse;
}(DukResponse));
exports.DukListBreakResponse = DukListBreakResponse;
var DukEvalResponse = (function (_super) {
    __extends(DukEvalResponse, _super);
    function DukEvalResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.EVAL) || this;
        if (msg.length != 4)
            throw new Error("Invalid 'Eval' response message.");
        _this.success = (msg[1].value == 0);
        _this.result = msg[2].value;
        return _this;
    }
    return DukEvalResponse;
}(DukResponse));
exports.DukEvalResponse = DukEvalResponse;
var DukGetHeapObjInfoResponse = (function (_super) {
    __extends(DukGetHeapObjInfoResponse, _super);
    function DukGetHeapObjInfoResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.GETHEAPOBJINFO) || this;
        assert(msg.length >= 2);
        _this.properties = [];
        for (var i = 1; i < msg.length - 1;) {
            var prop = new Duk.Property();
            prop.flags = msg[i++].value;
            prop.key = msg[i++].value;
            prop.value = msg[i++].value;
            if (prop.flags & Duk.PropDescFlag.ATTR_ACCESSOR)
                prop.value = [prop.value, msg[i++].value];
            _this.properties.push(prop);
        }
        return _this;
    }
    Object.defineProperty(DukGetHeapObjInfoResponse.prototype, "maxPropDescRange", {
        get: function () {
            var e_next, a_size;
            for (var i = 0; i < this.properties.length; i++) {
                if (this.properties[i].key == "e_next") {
                    e_next = this.properties[i];
                    break;
                }
            }
            for (var i = 0; i < this.properties.length; i++) {
                if (this.properties[i].key == "a_size") {
                    a_size = this.properties[i];
                    break;
                }
            }
            return e_next.value + a_size.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DukGetHeapObjInfoResponse.prototype, "maxPropEntriesRange", {
        get: function () {
            for (var i = 0; i < this.properties.length; i++) {
                if (this.properties[i].key == "e_next")
                    return this.properties[i].value;
            }
        },
        enumerable: true,
        configurable: true
    });
    return DukGetHeapObjInfoResponse;
}(DukResponse));
exports.DukGetHeapObjInfoResponse = DukGetHeapObjInfoResponse;
var DukGetObjPropDescRangeResponse = (function (_super) {
    __extends(DukGetObjPropDescRangeResponse, _super);
    function DukGetObjPropDescRangeResponse(msg) {
        var _this = _super.call(this, msg) || this;
        _this.cmd = Duk.CmdType.GETOBJPROPDESCRANGE;
        return _this;
    }
    return DukGetObjPropDescRangeResponse;
}(DukGetHeapObjInfoResponse));
exports.DukGetObjPropDescRangeResponse = DukGetObjPropDescRangeResponse;
var DukGetClosureResponse = (function (_super) {
    __extends(DukGetClosureResponse, _super);
    function DukGetClosureResponse(msg) {
        var _this = _super.call(this, Duk.CmdType.GETSCOPEKEYS) || this;
        var scopes = [];
        for (var i = 1; i < msg.length - 1; i++) {
            var scope = [];
            for (; i < msg.length - 1; i++) {
                if (msg[i].type == Duk.DValKind.int) {
                    assert(msg[i].value == 0);
                    scopes.push(scope);
                    break;
                }
                var name_2 = msg[i].value;
                scope.push(name_2);
            }
        }
        if (scopes.length < 2)
            throw new Error("GETSCOPEKEYS: Returned less than 2 scopes.");
        _this.local = scopes[0];
        _this.global = scopes[scopes.length - 1];
        _this.closure = [];
        if (scopes.length > 2) {
            for (var i = 1; i < scopes.length - 1; i++) {
                for (var j = 0; j < scopes[i].length; j++)
                    _this.closure.push(scopes[i][j]);
            }
        }
        return _this;
    }
    return DukGetClosureResponse;
}(DukResponse));
exports.DukGetClosureResponse = DukGetClosureResponse;
var DukMsgBuilder = (function () {
    function DukMsgBuilder(size) {
        this.length = 0;
        this.buf = new Buffer(size);
    }
    DukMsgBuilder.prototype.writeREQ = function () {
        this.writeByte(Duk.DvalIB.REQ);
    };
    DukMsgBuilder.prototype.writeEOM = function () {
        this.writeByte(Duk.DvalIB.EOM);
    };
    DukMsgBuilder.prototype.writeInt = function (val) {
        assert(typeof val === "number");
        val = Math.floor(val);
        if (val >= 0 && val <= 63) {
            this.writeByte(Duk.DvalIB.INTV_SM_MIN + val);
        }
        else if (val >= 0 && val <= 16383) {
            var ib = Duk.DvalIB.INTV_LRG_MIN + ((val >> 8) & 0xFF);
            var sb = val & 0xFF;
            this.checkResize(2);
            this.buf.writeUInt8(ib, this.length);
            this.buf.writeUInt8(sb, this.length + 1);
            this.length += 2;
        }
        else {
            this.checkResize(5);
            this.buf.writeUInt8(Duk.DvalIB.INT32, this.length++);
            this.buf.writeInt32BE(val, this.length);
            this.length += 4;
        }
    };
    DukMsgBuilder.prototype.writeString = function (val) {
        assert(typeof val === "string" ||
            typeof val === "undefined");
        if (val === undefined || val.length < 1)
            this.writeUndefined();
        else {
            var strbuf = this.encodeString(val);
            var len = strbuf.length;
            this.checkResize(len + 4);
            if (val.length <= 31) {
                this.buf.writeUInt8(Duk.DvalIB.STRV_MIN + len, this.length++);
            }
            else if (val.length <= 65535) {
                this.buf.writeUInt8(Duk.DvalIB.STR16, this.length++);
                this.buf.writeUInt16BE(len, this.length);
                this.length += 2;
            }
            else {
                this.buf.writeUInt8(Duk.DvalIB.STR32, this.length++);
                this.buf.writeUInt32BE(len, this.length);
                this.length += 4;
            }
            strbuf.copy(this.buf, this.length, 0, len);
            this.length += len;
        }
    };
    DukMsgBuilder.prototype.writePointer = function (ptr) {
        this.checkResize(2 + ptr.size);
        this.buf.writeUInt8(Duk.DvalIB.POINTER, this.length++);
        this.buf.writeUInt8(ptr.size, this.length++);
        var offset = 0;
        if (ptr.size == 8) {
            this.buf.writeUInt32BE(ptr.hipart, this.length);
            offset = 4;
        }
        this.buf.writeUInt32BE(ptr.lopart, this.length + offset);
        this.length += ptr.size;
    };
    DukMsgBuilder.prototype.writeUndefined = function () {
        this.checkResize(1);
        this.buf.writeUInt8(Duk.DvalIB.UNDEFINED, this.length++);
    };
    DukMsgBuilder.prototype.writeByte = function (val) {
        this.checkResize(1);
        this.buf.writeUInt8(val, this.length++);
    };
    DukMsgBuilder.prototype.finish = function () {
        var newBuf = new Buffer(this.length);
        if (this.length > 0)
            this.buf.copy(newBuf, 0, 0, this.length);
        this.clear();
        return newBuf;
    };
    DukMsgBuilder.prototype.clear = function () {
        this.length = 0;
    };
    DukMsgBuilder.prototype.encodeString = function (val) {
        var len = Buffer.byteLength(val, "utf8");
        var buf = new Buffer(len);
        buf.write(val, 0);
        return buf;
    };
    DukMsgBuilder.prototype.checkResize = function (writeSize) {
        var requiredSize = (this.length + writeSize);
        if (requiredSize > this.buf.length) {
            var newBuf = new Buffer(requiredSize);
            this.buf.copy(newBuf, 0, 0, this.length);
            this.buf = newBuf;
        }
    };
    return DukMsgBuilder;
}());
var PromiseContext = (function () {
    function PromiseContext() {
    }
    return PromiseContext;
}());
var PendingRequest = (function () {
    function PendingRequest(cmd, sequence, promise, pcontext, buf) {
        this.cmd = cmd;
        this.sequence = sequence;
        this.promise = promise;
        this.pcontext = pcontext;
        this.buf = buf;
    }
    return PendingRequest;
}());
var DukEvent;
(function (DukEvent) {
    DukEvent[DukEvent["disconnected"] = 0] = "disconnected";
    DukEvent[DukEvent["nfy_status"] = 1] = "nfy_status";
    DukEvent[DukEvent["nfy_print"] = 2] = "nfy_print";
    DukEvent[DukEvent["nfy_alert"] = 3] = "nfy_alert";
    DukEvent[DukEvent["nfy_log"] = 4] = "nfy_log";
    DukEvent[DukEvent["nfy_throw"] = 5] = "nfy_throw";
    DukEvent[DukEvent["nfy_detaching"] = 6] = "nfy_detaching";
})(DukEvent = exports.DukEvent || (exports.DukEvent = {}));
var State;
(function (State) {
    State[State["Offline"] = 0] = "Offline";
    State[State["Connecting"] = 1] = "Connecting";
    State[State["Verification"] = 2] = "Verification";
    State[State["Online"] = 3] = "Online";
})(State || (State = {}));
var DukDbgProtocol = (function (_super) {
    __extends(DukDbgProtocol, _super);
    function DukDbgProtocol(conn, remainderBuf, logger) {
        var _this = _super.call(this) || this;
        _this._emmitedDisonnected = false;
        _this.log = (logger || (function () { }));
        _this._inBufSize = 0;
        _this._outBuf = new DukMsgBuilder(DukDbgProtocol.OUT_BUF_SIZE);
        _this._inBuf = new Buffer(DukDbgProtocol.IN_BUF_SIZE);
        _this._inBuf.fill(0);
        _this._msg = [];
        _this._numDvalues = 0;
        _this._conn = conn;
        _this._version = conn._protoVersion;
        _this.reset();
        _this._conn._socket.on("data", function (data) { return _this.onReceiveData(data); });
        _this._conn.once("error", function (err) {
            _this.onDisconnected("Connection error: " + err);
        });
        _this._conn.once("disconnect", function (reason) {
            _this.onDisconnected(reason);
        });
        if (remainderBuf.length > 0)
            _this.onReceiveData(remainderBuf);
        return _this;
    }
    DukDbgProtocol.prototype.disconnect = function (reason) {
        if (reason === void 0) { reason = ""; }
        if (!this.isConnected)
            return;
        this._conn.closeSocket(reason);
        this._conn = null;
    };
    DukDbgProtocol.prototype.onDisconnected = function (reason) {
        if (this._emmitedDisonnected)
            return;
        this._emmitedDisonnected = true;
        this._conn = null;
        this.emit(DukEvent[DukEvent.disconnected], reason);
    };
    Object.defineProperty(DukDbgProtocol.prototype, "isConnected", {
        get: function () {
            return !(this._conn === null || this._conn === undefined);
        },
        enumerable: true,
        configurable: true
    });
    DukDbgProtocol.prototype.requestBasicInfo = function () {
        return this.sendSimpleRequest(Duk.CmdType.BASICINFO);
    };
    DukDbgProtocol.prototype.requestResume = function () {
        return this.sendSimpleRequest(Duk.CmdType.RESUME);
    };
    DukDbgProtocol.prototype.requestPause = function () {
        return this.sendSimpleRequest(Duk.CmdType.PAUSE);
    };
    DukDbgProtocol.prototype.requestCallStack = function () {
        return this.sendSimpleRequest(Duk.CmdType.GETCALLSTACK);
    };
    DukDbgProtocol.prototype.requestStepOver = function () {
        return this.sendSimpleRequest(Duk.CmdType.STEPOVER);
    };
    DukDbgProtocol.prototype.requestStepInto = function () {
        return this.sendSimpleRequest(Duk.CmdType.STEPINTO);
    };
    DukDbgProtocol.prototype.requestStepOut = function () {
        return this.sendSimpleRequest(Duk.CmdType.STEPOUT);
    };
    DukDbgProtocol.prototype.requestSetBreakpoint = function (file, line) {
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.ADDBREAK);
        this._outBuf.writeString(file);
        this._outBuf.writeInt(line);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.ADDBREAK, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestRemoveBreakpoint = function (index) {
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.DELBREAK);
        this._outBuf.writeInt(index);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.DELBREAK, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestListBreakpoints = function () {
        return this.sendSimpleRequest(Duk.CmdType.LISTBREAK);
    };
    DukDbgProtocol.prototype.requestDetach = function () {
        return this.sendSimpleRequest(Duk.CmdType.DETACH);
    };
    DukDbgProtocol.prototype.requestLocalVariables = function (stackLevel) {
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.GETLOCALS);
        this._outBuf.writeInt(stackLevel);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.GETLOCALS, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestEval = function (expression, stackLevel) {
        if (stackLevel === void 0) { stackLevel = -1; }
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.EVAL);
        if (this._version.proto == 1) {
            this._outBuf.writeString(expression);
            this._outBuf.writeInt(stackLevel);
            this._outBuf.writeEOM();
        }
        else if (this._version.proto == 2) {
            this._outBuf.writeInt(stackLevel);
            this._outBuf.writeString(expression);
            this._outBuf.writeEOM();
        }
        return this.sendRequest(Duk.CmdType.EVAL, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestInspectHeapObj = function (ptr, flags) {
        if (flags === void 0) { flags = 0; }
        if (!ptr || (!ptr.lopart && !ptr.hipart)) {
            this.log("requestInspectHeapObj: Warning pointer was NULL");
            return Promise.reject(null);
        }
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.GETHEAPOBJINFO);
        this._outBuf.writePointer(ptr);
        this._outBuf.writeInt(flags);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.GETHEAPOBJINFO, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestGetObjPropDescRange = function (ptr, idxStart, idxEnd) {
        if (!ptr || (!ptr.lopart && !ptr.hipart)) {
            this.log("requestGetObjPropDescRange: Warning pointer was NULL");
            return Promise.reject(null);
        }
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.GETOBJPROPDESCRANGE);
        this._outBuf.writePointer(ptr);
        this._outBuf.writeInt(idxStart);
        this._outBuf.writeInt(idxEnd);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.GETOBJPROPDESCRANGE, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.requestClosures = function (mask, stackDepth) {
        if (stackDepth === void 0) { stackDepth = -1; }
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(Duk.CmdType.GETSCOPEKEYS);
        this._outBuf.writeInt(mask);
        this._outBuf.writeInt(stackDepth);
        this._outBuf.writeEOM();
        return this.sendRequest(Duk.CmdType.GETSCOPEKEYS, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.sendSimpleRequest = function (cmd) {
        this._outBuf.clear();
        this._outBuf.writeREQ();
        this._outBuf.writeInt(cmd);
        this._outBuf.writeEOM();
        return this.sendRequest(cmd, this._outBuf.finish());
    };
    DukDbgProtocol.prototype.sendRequest = function (cmd, buf) {
        var pcontext = new PromiseContext();
        var cb = function (resolve, reject) {
            pcontext.resolve = resolve;
            pcontext.reject = reject;
        };
        var p = new Promise(cb);
        var req = new PendingRequest(cmd, ++this._requestSequence, p, pcontext, buf);
        if (this._curRequest != null) {
            this._requestQueue.push(req);
        }
        else {
            if (!this.submitRequest(req))
                return Promise.reject("Failed to submit request.");
        }
        return p;
    };
    DukDbgProtocol.prototype.submitRequest = function (req) {
        assert(this._curRequest == null && this._conn && this._conn._socket);
        if (MSG_TRACING) {
            var cmd = req.cmd;
            this.log("OUT -> <REQ: " + Duk.DvalIB.REQ + "> <0x" + cmd.toString(16) + ": " + Duk.CmdType[cmd] + ">");
        }
        var socket = this._conn._socket;
        if (!socket.write(req.buf)) {
            this.disconnect("Failed to write data to socket.");
            return false;
        }
        this._curRequest = req;
        return true;
    };
    DukDbgProtocol.prototype.onReceiveData = function (data) {
        var buf = this._inBuf;
        if (!this.readData(data)) {
            this.log("The receive buffer overflowed.");
            this.disconnect("The receive buffer overflowed.");
            return;
        }
        this.readMessages();
        if (this._inReadPos > 0) {
            this.consume(this._inReadPos);
            this._inReadPos = 0;
        }
    };
    DukDbgProtocol.prototype.readMessages = function () {
        var buf = this._inBuf;
        var pos = 0;
        var available = this._inBufSize;
        var remaining = function () { return available - pos; };
        var readPtr = function (size) {
            var dvalBuf = new Buffer(size);
            buf.copy(dvalBuf, 0, pos, pos + size);
            var lopart = 0, hipart = 0;
            if (size == 4) {
                lopart = dvalBuf.readUInt32BE(0);
            }
            else if (size == 8) {
                hipart = dvalBuf.readUInt32BE(0);
                lopart = dvalBuf.readUInt32BE(4);
            }
            else
                throw new Error("Unknown pointer size: " + size);
            return new Duk.TValPointer(size, lopart, hipart);
        };
        while (pos < available) {
            var x = buf[pos++];
            var v = undefined;
            var gotValue = false;
            if (x >= Duk.DvalIB.INTV_LRG_MIN) {
                if (remaining() < 1)
                    return;
                v = new Duk.DValue(Duk.DValKind.int, ((x - 0xc0) << 8) + buf[pos++]);
            }
            else if (x >= Duk.DvalIB.INTV_SM_MIN) {
                v = new Duk.DValue(Duk.DValKind.int, x - 0x80);
            }
            else if (x >= Duk.DvalIB.STRV_MIN) {
                var len = x - 0x60;
                if (remaining() >= len) {
                    v = new Duk.DValue(Duk.DValKind.str, this.bufferToDebugString(buf, pos, len));
                    pos += len;
                }
                else
                    return;
            }
            else {
                switch (x) {
                    case Duk.DvalIB.REQ:
                    case Duk.DvalIB.REP:
                    case Duk.DvalIB.ERR:
                    case Duk.DvalIB.NFY:
                        assert(this._msg.length === 0);
                        v = new Duk.DValue(x, x);
                        break;
                    case Duk.DvalIB.EOM:
                        v = new Duk.DValue(Duk.DValKind.EOM, Duk.DvalIB.EOM);
                        assert(this._msg.length > 0);
                        break;
                    case Duk.DvalIB.INT32:
                        if (remaining() < 4)
                            return;
                        v = new Duk.DValue(Duk.DValKind.int, buf.readInt32BE(pos));
                        pos += 4;
                        break;
                    case Duk.DvalIB.STR32:
                        if (remaining() >= 4) {
                            var len = buf.readUInt32BE(pos);
                            pos += 4;
                            if (remaining() < len)
                                return;
                            v = new Duk.DValue(Duk.DValKind.str, this.bufferToDebugString(buf, pos, len));
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.STR16:
                        if (remaining() >= 2) {
                            var len = buf.readUInt16BE(pos);
                            pos += 2;
                            if (remaining() < len)
                                return;
                            v = new Duk.DValue(Duk.DValKind.str, this.bufferToDebugString(buf, pos, len));
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.BUF32:
                        if (remaining() >= 4) {
                            var len = buf.readUInt32BE(pos);
                            pos += 4;
                            if (remaining() < len)
                                return;
                            var dvalBuf = new Buffer(len);
                            buf.copy(dvalBuf, 0, pos, pos + len);
                            v = new Duk.DValue(Duk.DValKind.buf, dvalBuf);
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.BUF16:
                        if (remaining() >= 2) {
                            var len = buf.readUInt16BE(pos);
                            pos += 2;
                            if (remaining() < len)
                                return;
                            var dvalBuf = new Buffer(len);
                            buf.copy(dvalBuf, 0, pos, pos + len);
                            v = new Duk.DValue(Duk.DValKind.buf, dvalBuf);
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.UNUSED:
                        v = new Duk.DValue(Duk.DValKind.tval, undefined);
                        break;
                    case Duk.DvalIB.UNDEFINED:
                        v = new Duk.DValue(Duk.DValKind.tval, undefined);
                        break;
                    case Duk.DvalIB.NULL:
                        v = new Duk.DValue(Duk.DValKind.tval, null);
                        break;
                    case Duk.DvalIB.TRUE:
                        v = new Duk.DValue(Duk.DValKind.tval, true);
                        break;
                    case Duk.DvalIB.FALSE:
                        v = new Duk.DValue(Duk.DValKind.tval, false);
                        break;
                    case Duk.DvalIB.NUMBER:
                        if (remaining() >= 8) {
                            v = new Duk.DValue(Duk.DValKind.tval, buf.readDoubleBE(pos));
                            pos += 8;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.OBJECT:
                        if (remaining() >= 2) {
                            var cls = buf[pos];
                            var len = buf[pos + 1];
                            pos += 2;
                            if (remaining() < len)
                                return;
                            var ptr = readPtr(len);
                            v = new Duk.DValue(Duk.DValKind.tval, new Duk.TValObject(cls, ptr));
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.POINTER:
                        if (remaining() >= 1) {
                            var len = buf[pos++];
                            if (remaining() < len)
                                return;
                            var ptr = readPtr(len);
                            v = new Duk.DValue(Duk.DValKind.ptr, ptr);
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.LIGHTFUNC:
                        if (remaining() >= 3) {
                            var flags = buf.readUInt16BE(pos);
                            var len = buf[pos + 2];
                            pos += 3;
                            if (remaining() < len)
                                return;
                            var ptr = readPtr(len);
                            v = new Duk.DValue(Duk.DValKind.tval, new Duk.TValLightFunc(flags, ptr));
                            pos += len;
                        }
                        else
                            return;
                        break;
                    case Duk.DvalIB.HEAPPTR:
                        if (remaining() >= 1) {
                            var len = buf[pos++];
                            if (remaining() < len)
                                return;
                            var ptr = readPtr(len);
                            v = new Duk.DValue(Duk.DValKind.tval, ptr);
                            pos += len;
                        }
                        else
                            return;
                        break;
                    default:
                        this.disconnect("DVal parse error, dropping connection.");
                        return;
                }
            }
            assert(v);
            this._msg.push(v);
            this._numDvalues++;
            this._inReadPos = pos;
            if (x === Duk.DvalIB.EOM) {
                this.translateMessage(this._msg);
                this._msg = [];
            }
        }
    };
    DukDbgProtocol.prototype.translateMessage = function (msg) {
        assert(msg.length > 0);
        var ib = msg[0].value;
        if (MSG_TRACING) {
            if (LOG_STATUS_NOTIFY ||
                (msg[0].value != Duk.MsgType.NFY ||
                    msg[1].value != Duk.NotifyType.STATUS)) {
                var mStr = "IN <- ";
                for (var i = 0; i < msg.length; i++) {
                    var dval = msg[i];
                    mStr += "<" + Duk.DValKind[dval.type] + ": " + String(dval.value) + "> ";
                }
                this.log(mStr);
            }
        }
        switch (ib) {
            default:
                this.log("warning: Received unknown message type: 0x" + ib.toString(16) + ". Discarding.");
                return;
            case Duk.MsgType.EOM:
                this.log("warning: Received empty message, discarding.");
                return;
            case Duk.MsgType.REQ:
                this.parseRequestMessage(msg);
                break;
            case Duk.MsgType.REP:
            case Duk.MsgType.ERR:
                this.parseResponseMessage(msg);
                break;
            case Duk.MsgType.NFY:
                this.parseNotificationMessage(msg);
                break;
        }
    };
    DukDbgProtocol.prototype.parseRequestMessage = function (msg) {
        throw new Error("Received request message.");
    };
    DukDbgProtocol.prototype.parseNotificationMessage = function (msg) {
        try {
            var id = msg[1].value;
            switch (id) {
                case Duk.NotifyType.STATUS:
                    this.emit(DukEvent[DukEvent.nfy_status], new DukStatusNotification(msg));
                    break;
                case Duk.NotifyType.PRINT:
                    this.emit(DukEvent[DukEvent.nfy_print], new DukPrintNotification(msg));
                    break;
                case Duk.NotifyType.ALERT:
                    this.emit(DukEvent[DukEvent.nfy_alert], new DukAlertNotification(msg));
                    break;
                case Duk.NotifyType.LOG:
                    this.emit(DukEvent[DukEvent.nfy_log], new DukLogNotification(msg));
                    break;
                case Duk.NotifyType.THROW:
                    this.emit(DukEvent[DukEvent.nfy_throw], new DukThrowNotification(msg));
                    break;
                case Duk.NotifyType.DETACHING:
                    {
                        var code = msg[2].value;
                        var err = (msg.length > 4 ? msg[3].value : "");
                        var reason = "Target detached: ( " + code + " )  " + err;
                        this.disconnect(reason);
                    }
                    break;
                case Duk.NotifyType.APP_MSG:
                    break;
            }
        }
        catch (err) {
            this.log("Error parsing notification message: " + err);
        }
    };
    DukDbgProtocol.prototype.parseResponseMessage = function (msg) {
        assert(this._curRequest != null);
        var req = this._curRequest;
        this._curRequest = null;
        if (!req) {
            this.log("Warning: Received a response without a request!");
            return;
        }
        var cmd = req.cmd;
        if (msg[0].value == Duk.MsgType.ERR) {
            var errType = msg.length > 2 ? msg[1].value : 0;
            var errMsg = msg.length > 3 ? msg[2].value : "";
            var errStr = "Request " + Duk.MsgType[cmd] + " returned error: " +
                (Duk.ERR_TYPE_MAP[errType] + " : " + errMsg);
            this.log(errStr);
            req.pcontext.reject(errStr);
        }
        else {
            var value = undefined;
            var failed = false;
            try {
                switch (cmd) {
                    default:
                        assert(false);
                        break;
                    case Duk.CmdType.PAUSE:
                    case Duk.CmdType.RESUME:
                    case Duk.CmdType.STEPINTO:
                    case Duk.CmdType.STEPOVER:
                    case Duk.CmdType.STEPOUT:
                    case Duk.CmdType.DELBREAK:
                    case Duk.CmdType.DETACH:
                    case Duk.CmdType.TRIGGERSTATUS:
                        break;
                    case Duk.CmdType.BASICINFO:
                        value = new DukBasicInfoResponse(msg);
                        break;
                    case Duk.CmdType.LISTBREAK:
                        value = new DukListBreakResponse(msg);
                        break;
                    case Duk.CmdType.ADDBREAK:
                        value = new DukAddBreakResponse(msg);
                        break;
                    case Duk.CmdType.GETVAR:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.PUTVAR:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.GETCALLSTACK:
                        value = new DukGetCallStackResponse(msg);
                        break;
                    case Duk.CmdType.GETLOCALS:
                        value = new DukGetLocalsResponse(msg);
                        break;
                    case Duk.CmdType.EVAL:
                        value = new DukEvalResponse(msg);
                        break;
                    case Duk.CmdType.DUMPHEAP:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.GETBYTECODE:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.APPCOMMAND:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.GETHEAPOBJINFO:
                        value = new DukGetHeapObjInfoResponse(msg);
                        break;
                    case Duk.CmdType.GETOBJPROPDESC:
                        throw new Error("Unimplemented");
                        break;
                    case Duk.CmdType.GETOBJPROPDESCRANGE:
                        value = new DukGetObjPropDescRangeResponse(msg);
                        break;
                    case Duk.CmdType.GETSCOPEKEYS:
                        value = new DukGetClosureResponse(msg);
                        break;
                }
            }
            catch (err) {
                req.pcontext.reject(err);
                failed = true;
            }
            if (!failed)
                req.pcontext.resolve(value);
        }
        while (this._requestQueue.length > 0) {
            var req_1 = this._requestQueue.shift();
            if (this.submitRequest(req_1))
                break;
            else
                req_1.pcontext.reject("Failed to submit request.");
        }
    };
    DukDbgProtocol.prototype.bufferToDebugString = function (buf, pos, len) {
        var cp = new Array(len);
        for (var i = 0; i < len; i++) {
            cp[i] = buf[pos + i];
        }
        return String.fromCharCode.apply(String, cp);
    };
    DukDbgProtocol.prototype.readData = function (data) {
        var buf = this._inBuf;
        var available = data.length;
        if ((this._inBufSize + available) > buf.length)
            return false;
        data.copy(buf, this._inBufSize, 0, available);
        this._inBufSize += available;
        return true;
    };
    DukDbgProtocol.prototype.consume = function (count) {
        var remainder = this._inBufSize - count;
        if (remainder > 0)
            this._inBuf.copy(this._inBuf, 0, count, this._inBufSize);
        this._inBufSize = remainder;
    };
    DukDbgProtocol.prototype.reset = function () {
        this._inBufSize = 0;
        this._inReadPos = 0;
        this._numDvalues = 0;
        this._msg = [];
        this._requestSequence = 0;
        this._curRequest = null;
        this._requestQueue = [];
    };
    return DukDbgProtocol;
}(EE.EventEmitter));
DukDbgProtocol.OUT_BUF_SIZE = 1024 * 1;
DukDbgProtocol.IN_BUF_SIZE = 1024 * 16;
exports.DukDbgProtocol = DukDbgProtocol;
