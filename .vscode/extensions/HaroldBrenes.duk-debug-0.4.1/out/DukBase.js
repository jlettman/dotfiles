"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MsgType;
(function (MsgType) {
    MsgType[MsgType["EOM"] = 0] = "EOM";
    MsgType[MsgType["REQ"] = 1] = "REQ";
    MsgType[MsgType["REP"] = 2] = "REP";
    MsgType[MsgType["ERR"] = 3] = "ERR";
    MsgType[MsgType["NFY"] = 4] = "NFY";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
var DvalIB;
(function (DvalIB) {
    DvalIB[DvalIB["EOM"] = 0] = "EOM";
    DvalIB[DvalIB["REQ"] = 1] = "REQ";
    DvalIB[DvalIB["REP"] = 2] = "REP";
    DvalIB[DvalIB["ERR"] = 3] = "ERR";
    DvalIB[DvalIB["NFY"] = 4] = "NFY";
    DvalIB[DvalIB["INT32"] = 16] = "INT32";
    DvalIB[DvalIB["STR32"] = 17] = "STR32";
    DvalIB[DvalIB["STR16"] = 18] = "STR16";
    DvalIB[DvalIB["BUF32"] = 19] = "BUF32";
    DvalIB[DvalIB["BUF16"] = 20] = "BUF16";
    DvalIB[DvalIB["UNUSED"] = 21] = "UNUSED";
    DvalIB[DvalIB["UNDEFINED"] = 22] = "UNDEFINED";
    DvalIB[DvalIB["NULL"] = 23] = "NULL";
    DvalIB[DvalIB["TRUE"] = 24] = "TRUE";
    DvalIB[DvalIB["FALSE"] = 25] = "FALSE";
    DvalIB[DvalIB["NUMBER"] = 26] = "NUMBER";
    DvalIB[DvalIB["OBJECT"] = 27] = "OBJECT";
    DvalIB[DvalIB["POINTER"] = 28] = "POINTER";
    DvalIB[DvalIB["LIGHTFUNC"] = 29] = "LIGHTFUNC";
    DvalIB[DvalIB["HEAPPTR"] = 30] = "HEAPPTR";
    DvalIB[DvalIB["STRV_MIN"] = 96] = "STRV_MIN";
    DvalIB[DvalIB["STRV_MAX"] = 127] = "STRV_MAX";
    DvalIB[DvalIB["INTV_SM_MIN"] = 128] = "INTV_SM_MIN";
    DvalIB[DvalIB["INTV_SM_MAX"] = 191] = "INTV_SM_MAX";
    DvalIB[DvalIB["INTV_LRG_MIN"] = 192] = "INTV_LRG_MIN";
    DvalIB[DvalIB["INTV_LRG_MAX"] = 255] = "INTV_LRG_MAX";
})(DvalIB = exports.DvalIB || (exports.DvalIB = {}));
var NotifyType;
(function (NotifyType) {
    NotifyType[NotifyType["STATUS"] = 1] = "STATUS";
    NotifyType[NotifyType["PRINT"] = 2] = "PRINT";
    NotifyType[NotifyType["ALERT"] = 3] = "ALERT";
    NotifyType[NotifyType["LOG"] = 4] = "LOG";
    NotifyType[NotifyType["THROW"] = 5] = "THROW";
    NotifyType[NotifyType["DETACHING"] = 6] = "DETACHING";
    NotifyType[NotifyType["APP_MSG"] = 7] = "APP_MSG";
})(NotifyType = exports.NotifyType || (exports.NotifyType = {}));
var CmdType;
(function (CmdType) {
    CmdType[CmdType["BASICINFO"] = 16] = "BASICINFO";
    CmdType[CmdType["TRIGGERSTATUS"] = 17] = "TRIGGERSTATUS";
    CmdType[CmdType["PAUSE"] = 18] = "PAUSE";
    CmdType[CmdType["RESUME"] = 19] = "RESUME";
    CmdType[CmdType["STEPINTO"] = 20] = "STEPINTO";
    CmdType[CmdType["STEPOVER"] = 21] = "STEPOVER";
    CmdType[CmdType["STEPOUT"] = 22] = "STEPOUT";
    CmdType[CmdType["LISTBREAK"] = 23] = "LISTBREAK";
    CmdType[CmdType["ADDBREAK"] = 24] = "ADDBREAK";
    CmdType[CmdType["DELBREAK"] = 25] = "DELBREAK";
    CmdType[CmdType["GETVAR"] = 26] = "GETVAR";
    CmdType[CmdType["PUTVAR"] = 27] = "PUTVAR";
    CmdType[CmdType["GETCALLSTACK"] = 28] = "GETCALLSTACK";
    CmdType[CmdType["GETLOCALS"] = 29] = "GETLOCALS";
    CmdType[CmdType["EVAL"] = 30] = "EVAL";
    CmdType[CmdType["DETACH"] = 31] = "DETACH";
    CmdType[CmdType["DUMPHEAP"] = 32] = "DUMPHEAP";
    CmdType[CmdType["GETBYTECODE"] = 33] = "GETBYTECODE";
    CmdType[CmdType["APPCOMMAND"] = 34] = "APPCOMMAND";
    CmdType[CmdType["GETHEAPOBJINFO"] = 35] = "GETHEAPOBJINFO";
    CmdType[CmdType["GETOBJPROPDESC"] = 36] = "GETOBJPROPDESC";
    CmdType[CmdType["GETOBJPROPDESCRANGE"] = 37] = "GETOBJPROPDESCRANGE";
    CmdType[CmdType["GETSCOPEKEYS"] = 127] = "GETSCOPEKEYS";
})(CmdType = exports.CmdType || (exports.CmdType = {}));
var PropDescFlag;
(function (PropDescFlag) {
    PropDescFlag[PropDescFlag["ATTR_WRITABLE"] = 1] = "ATTR_WRITABLE";
    PropDescFlag[PropDescFlag["ATTR_ENUMERABLE"] = 2] = "ATTR_ENUMERABLE";
    PropDescFlag[PropDescFlag["ATTR_CONFIGURABLE"] = 4] = "ATTR_CONFIGURABLE";
    PropDescFlag[PropDescFlag["ATTR_ACCESSOR"] = 8] = "ATTR_ACCESSOR";
    PropDescFlag[PropDescFlag["VIRTUAL"] = 16] = "VIRTUAL";
    PropDescFlag[PropDescFlag["INTERNAL"] = 256] = "INTERNAL";
})(PropDescFlag = exports.PropDescFlag || (exports.PropDescFlag = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["UNKNOWN"] = 0] = "UNKNOWN";
    ErrorType[ErrorType["UNSUPPORTED"] = 1] = "UNSUPPORTED";
    ErrorType[ErrorType["TOOMANY"] = 2] = "TOOMANY";
    ErrorType[ErrorType["NOTFOUND"] = 3] = "NOTFOUND";
    ErrorType[ErrorType["APP_ERROR"] = 4] = "APP_ERROR";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
exports.ERR_TYPE_MAP = [
    "Unknown or unspecified error",
    "Unsupported command",
    "Too many",
    "Not found",
    "Application error (e.g. AppRequest-related error)"
];
var DValKind;
(function (DValKind) {
    DValKind[DValKind["EOM"] = 0] = "EOM";
    DValKind[DValKind["REQ"] = 1] = "REQ";
    DValKind[DValKind["REP"] = 2] = "REP";
    DValKind[DValKind["ERR"] = 3] = "ERR";
    DValKind[DValKind["NFY"] = 4] = "NFY";
    DValKind[DValKind["int"] = 5] = "int";
    DValKind[DValKind["str"] = 6] = "str";
    DValKind[DValKind["buf"] = 7] = "buf";
    DValKind[DValKind["ptr"] = 8] = "ptr";
    DValKind[DValKind["tval"] = 9] = "tval";
    DValKind[DValKind["unused"] = 10] = "unused";
    DValKind[DValKind["undef"] = 11] = "undef";
    DValKind[DValKind["nul"] = 12] = "nul";
    DValKind[DValKind["num"] = 13] = "num";
})(DValKind = exports.DValKind || (exports.DValKind = {}));
var TValueType;
(function (TValueType) {
    TValueType[TValueType["UNUSED"] = 0] = "UNUSED";
    TValueType[TValueType["UNDEFINED"] = 1] = "UNDEFINED";
    TValueType[TValueType["NULL"] = 2] = "NULL";
    TValueType[TValueType["BOOLEAN"] = 3] = "BOOLEAN";
    TValueType[TValueType["NUMBER"] = 4] = "NUMBER";
    TValueType[TValueType["STRING"] = 5] = "STRING";
    TValueType[TValueType["BUFFER"] = 6] = "BUFFER";
    TValueType[TValueType["OBJECT"] = 7] = "OBJECT";
    TValueType[TValueType["POINTER"] = 8] = "POINTER";
    TValueType[TValueType["LIGHTFUNC"] = 9] = "LIGHTFUNC";
})(TValueType = exports.TValueType || (exports.TValueType = {}));
var TValPointer = (function () {
    function TValPointer(size, lopart, hipart) {
        this.size = size;
        this.lopart = lopart;
        this.hipart = hipart;
    }
    TValPointer.prototype.isNull = function () {
        return this.size == 0;
    };
    TValPointer.NullPtr = function () {
        return new TValPointer(0, 0, 0);
    };
    TValPointer.TryConvert = function (obj) {
        if (obj instanceof TValPointer)
            return obj;
        else if (obj instanceof TValObject)
            return obj.ptr;
        else if (obj instanceof TValLightFunc)
            return obj.ptr;
        else if (obj instanceof TValue)
            return TValPointer.TryConvert(obj.val);
        else
            return null;
    };
    TValPointer.prototype.toString = function () {
        return this.size == 4 ? "0x" + this.toPaddedHex(this.lopart) :
            "0x" + this.toPaddedHex(this.hipart) + this.toPaddedHex(this.lopart);
    };
    TValPointer.prototype.toPaddedHex = function (n) {
        var s = n.toString(16);
        var z = "";
        var c = 8 - s.length;
        for (var i = 0; i < c; i++)
            z += '0';
        return z + s;
    };
    return TValPointer;
}());
exports.TValPointer = TValPointer;
var TValObject = (function () {
    function TValObject(classID, ptr) {
        this.classID = classID;
        this.ptr = ptr;
    }
    TValObject.prototype.toString = function () {
        return "{ cls: " + this.classID + ", ptr: " + this.ptr.toString() + " }";
    };
    return TValObject;
}());
exports.TValObject = TValObject;
var TValLightFunc = (function () {
    function TValLightFunc(flags, ptr) {
        this.flags = flags;
        this.ptr = ptr;
    }
    TValLightFunc.prototype.toString = function () {
        return "{ flags: " + this.flags + ", ptr: " + this.ptr.toString() + " }";
    };
    return TValLightFunc;
}());
exports.TValLightFunc = TValLightFunc;
var TValue = (function () {
    function TValue(type, val) {
        this.type = type;
        this.val = val;
    }
    TValue.Unused = function () {
        return new TValue(TValueType.UNUSED, undefined);
    };
    TValue.Undefined = function () {
        return new TValue(TValueType.UNDEFINED, undefined);
    };
    TValue.Null = function () {
        return new TValue(TValueType.NULL, null);
    };
    TValue.Bool = function (val) {
        return new TValue(TValueType.BOOLEAN, val);
    };
    TValue.Number = function (val) {
        return new TValue(TValueType.NUMBER, val);
    };
    TValue.String = function (val) {
        return new TValue(TValueType.STRING, val);
    };
    TValue.Buffer = function (val) {
        return new TValue(TValueType.BUFFER, val);
    };
    TValue.Object = function (classID, ptr) {
        return new TValue(TValueType.OBJECT, new TValObject(classID, ptr));
    };
    TValue.Pointer = function (ptr) {
        return new TValue(TValueType.POINTER, ptr);
    };
    TValue.LightFunc = function (val) {
        return new TValue(TValueType.LIGHTFUNC, val);
    };
    return TValue;
}());
exports.TValue = TValue;
var DValue = (function () {
    function DValue(type, value) {
        this.type = type;
        this.value = value;
    }
    return DValue;
}());
exports.DValue = DValue;
var Property = (function () {
    function Property() {
    }
    Object.defineProperty(Property.prototype, "isAccessor", {
        get: function () {
            return (this.flags & PropDescFlag.ATTR_ACCESSOR) != 0;
        },
        enumerable: true,
        configurable: true
    });
    return Property;
}());
exports.Property = Property;
