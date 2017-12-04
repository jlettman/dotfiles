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
var Net = require("net");
var EE = require("events");
var State;
(function (State) {
    State[State["Offline"] = 0] = "Offline";
    State[State["Connecting"] = 1] = "Connecting";
    State[State["Verification"] = 2] = "Verification";
    State[State["Online"] = 3] = "Online";
})(State || (State = {}));
var DukConnection = (function (_super) {
    __extends(DukConnection, _super);
    function DukConnection() {
        var _this = _super.call(this) || this;
        _this._state = State.Offline;
        return _this;
    }
    DukConnection.connect = function (ip, port, timeoutMS, dbgLog) {
        if (timeoutMS === void 0) { timeoutMS = 5000; }
        var con = new DukConnection();
        con.dbgLog = dbgLog || (function () { });
        con._connect(ip, port, timeoutMS);
        return con;
    };
    DukConnection.prototype._connect = function (ip, port, timeoutMS) {
        var _this = this;
        var sock = new Net.Socket();
        this.log("Establishing connection with Duktape at " + ip + ":" + port);
        sock.setTimeout(timeoutMS, function () {
            _this.dbgLog("Connection timed out.");
            _this.onError(new Error("Connection timed out."));
        });
        sock.once("error", function (error) {
            _this.dbgLog("Connection error: " + error);
            _this.onError(error);
        });
        sock.on("close", function () {
            _this.closeSocket("Socked closed unexpectedly.");
        });
        sock.once("connect", function (event) {
            _this.log("Connected. Verifying protocol...");
            _this._state = State.Verification;
            sock.setTimeout(0);
            var inBuf = new Buffer(2048);
            var inSize = 0;
            var onData = function (data) {
                var rem = inBuf.length - inSize;
                if (rem < 1) {
                    _this.onError(new Error("Parse error (version identification too long), dropping connection"));
                    return;
                }
                var bytesToCopy = rem < data.length ? rem : data.length;
                data.copy(inBuf, inSize, 0, bytesToCopy);
                inSize += bytesToCopy;
                for (var i = 0; i < inSize; i++) {
                    if (inBuf[i] != 0x0A)
                        continue;
                    var verBuffer = new Buffer(i);
                    inBuf.copy(verBuffer, 0, 0, i);
                    var idString = verBuffer.toString("utf8");
                    _this.dbgLog("Protocol ID: " + idString);
                    var version;
                    try {
                        var split = idString.split(' ');
                        var dukVersion = Number(split[1]);
                        version = {
                            id: idString,
                            proto: Number(split[0]),
                            dukVersion: dukVersion,
                            gitDescribe: split[2],
                            target: split[3],
                            major: Math.floor(dukVersion / 10000),
                            minor: (dukVersion / 100) % 100,
                            patch: dukVersion % 100,
                        };
                        _this._protoVersion = version;
                    }
                    catch (err) {
                        _this.onError(new Error("Error validating protocol version: " + err));
                        return;
                    }
                    sock.removeListener("data", onData);
                    var inRem = inSize - i - 1;
                    var dataRem = data.length - bytesToCopy;
                    var remBuf = new Buffer(inRem + dataRem);
                    if (inRem > 0)
                        inBuf.copy(remBuf, 0, i + 1, inSize);
                    if (dataRem > 0)
                        data.copy(remBuf, inRem, bytesToCopy, dataRem);
                    _this.onConnected(remBuf, version);
                    return;
                }
                if (bytesToCopy < data.length) {
                    _this.onError(new Error("Input buffer overflow"));
                }
            };
            sock.on("data", onData);
        });
        sock.connect(port, ip);
        this._socket = sock;
        this._state = State.Connecting;
    };
    DukConnection.prototype.closeSocket = function (reason) {
        try {
            this._socket.removeAllListeners();
            this._socket.destroy();
            this._socket = null;
            this.dbgLog("Socket closed: " + reason);
            this.onDisconnect(reason);
        }
        catch (e) { }
    };
    DukConnection.prototype.onConnected = function (buf, version) {
        this._state = State.Online;
        this.emit("connected", buf, version);
    };
    DukConnection.prototype.onError = function (err) {
        this.closeSocket("Connection error: " + err);
        this.emit("error", err);
    };
    DukConnection.prototype.onDisconnect = function (reason) {
        this.emit("disconnect", reason || "");
    };
    DukConnection.prototype.log = function (msg) {
        console.log(msg);
    };
    return DukConnection;
}(EE.EventEmitter));
exports.DukConnection = DukConnection;
