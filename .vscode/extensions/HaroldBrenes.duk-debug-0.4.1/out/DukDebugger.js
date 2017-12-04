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
var vscode_debugadapter_1 = require("vscode-debugadapter");
var Path = require("path");
var FS = require("fs");
var assert = require("assert");
var sourceMaps_1 = require("./sourceMaps");
var Promise = require("bluebird");
var DukConnection_1 = require("./DukConnection");
var DukDbgProtocol_1 = require("./DukDbgProtocol");
var Duk = require("./DukBase");
var ArrayX = (function () {
    function ArrayX() {
    }
    ArrayX.firstOrNull = function (target, comparer) {
        for (var i = 0; i < target.length; i++)
            if (comparer(target[i]))
                return target[i];
        return null;
    };
    ArrayX.convert = function (target, converter) {
        var result = new Array(target.length);
        for (var i = 0; i < target.length; i++)
            result[i] = converter(target[i]);
        return result;
    };
    return ArrayX;
}());
var LaunchType;
(function (LaunchType) {
    LaunchType[LaunchType["Launch"] = 0] = "Launch";
    LaunchType[LaunchType["Attach"] = 1] = "Attach";
})(LaunchType || (LaunchType = {}));
var DukBreakPoint = (function () {
    function DukBreakPoint(filePath, line) {
        this.filePath = filePath;
        this.line = line;
    }
    return DukBreakPoint;
}());
var BreakPointMap = (function () {
    function BreakPointMap() {
        this._breakpoints = [];
    }
    BreakPointMap.prototype.find = function (filePath, line) {
        return ArrayX.firstOrNull(this._breakpoints, function (b) {
            return b.filePath === filePath && b.line === line;
        });
    };
    BreakPointMap.prototype.getBreakpointsForFile = function (filePath) {
        filePath = Path.normalize(filePath);
        var bps = this._breakpoints;
        var len = bps.length;
        var result = [];
        for (var i = 0; i < len; i++) {
            if (bps[i].filePath === filePath)
                result.push(bps[i]);
        }
        return result;
    };
    BreakPointMap.prototype.removeBreakpoints = function (remList) {
        var bps = this._breakpoints;
        remList.forEach(function (b) {
            for (var i = 0; i < bps.length; i++) {
                if (bps[i].dukIdx === b.dukIdx) {
                    bps[i] = null;
                    break;
                }
            }
        });
        for (var i = bps.length - 1; i >= 0; i--) {
            if (bps[i] == null)
                bps.splice(i, 1);
        }
        for (var i = 0; i < bps.length; i++)
            bps[i].dukIdx = i;
    };
    BreakPointMap.prototype.addBreakpoints = function (remList) {
        var bps = this._breakpoints;
        remList.forEach(function (b) { return bps.push(b); });
        for (var i = 0; i < bps.length; i++)
            bps[i].dukIdx = i;
    };
    return BreakPointMap;
}());
var SourceFilePosition = (function () {
    function SourceFilePosition() {
    }
    return SourceFilePosition;
}());
var SourceFile = (function () {
    function SourceFile() {
    }
    SourceFile.prototype.generated2Source = function (line) {
        if (this.srcMap) {
            var pos = this.srcMap.originalPositionFor(line, 0, sourceMaps_1.Bias.LEAST_UPPER_BOUND);
            if (pos.line != null) {
                return {
                    path: pos.source,
                    fileName: Path.basename(pos.source),
                    line: pos.line
                };
            }
        }
        return {
            path: this.path,
            fileName: this.name,
            line: line
        };
    };
    SourceFile.prototype.source2Generated = function (absSourcePath, line) {
        if (this.srcMap) {
            var pos = this.srcMap.generatedPositionFor(absSourcePath, line, 0, sourceMaps_1.Bias.LEAST_UPPER_BOUND);
            if (pos && pos.line != null) {
                return {
                    path: this.path,
                    fileName: this.name,
                    line: pos.line
                };
            }
        }
        return {
            path: this.path,
            fileName: this.name,
            line: line
        };
    };
    return SourceFile;
}());
var PropertySetType;
(function (PropertySetType) {
    PropertySetType[PropertySetType["Scope"] = 0] = "Scope";
    PropertySetType[PropertySetType["Object"] = 1] = "Object";
    PropertySetType[PropertySetType["Artificials"] = 2] = "Artificials";
})(PropertySetType || (PropertySetType = {}));
var PropertySet = (function () {
    function PropertySet(type) {
        this.classType = 0;
        this.type = type;
    }
    return PropertySet;
}());
var DukScope = (function () {
    function DukScope(name, stackFrame, properties) {
        this.name = name;
        this.stackFrame = stackFrame;
        this.properties = properties;
    }
    return DukScope;
}());
var DukStackFrame = (function () {
    function DukStackFrame(source, fileName, filePath, funcName, lineNumber, pc, depth, scopes) {
        this.source = source;
        this.fileName = fileName;
        this.filePath = filePath;
        this.funcName = funcName;
        this.lineNumber = lineNumber;
        this.pc = pc;
        this.depth = depth;
        this.scopes = scopes;
    }
    return DukStackFrame;
}());
var PtrPropDict = (function () {
    function PtrPropDict() {
    }
    return PtrPropDict;
}());
;
var DbgClientState = (function () {
    function DbgClientState() {
    }
    DbgClientState.prototype.reset = function () {
        this.paused = false;
        this.ptrHandles = new PtrPropDict();
        this.varHandles = new vscode_debugadapter_1.Handles();
        this.stackFrames = new vscode_debugadapter_1.Handles();
        this.scopes = new vscode_debugadapter_1.Handles();
    };
    return DbgClientState;
}());
var ErrorCode = (function () {
    function ErrorCode() {
    }
    return ErrorCode;
}());
ErrorCode.RequestFailed = 100;
var DukDebugSession = (function (_super) {
    __extends(DukDebugSession, _super);
    function DukDebugSession() {
        var _this = _super.call(this) || this;
        _this._nextSourceID = 1;
        _this._breakpoints = new BreakPointMap();
        _this._expectingBreak = "debugger";
        _this._expectingContinue = false;
        _this._isDisconnecting = false;
        _this._scopeMask = 3;
        _this._dbgLog = false;
        _this.setDebuggerLinesStartAt1(true);
        _this.setDebuggerColumnsStartAt1(true);
        _this._dbgState = new DbgClientState();
        _this._sources = {};
        _this._sourceToGen = {};
        _this._breakpoints._breakpoints = [];
        return _this;
    }
    DukDebugSession.prototype.initDukDbgProtocol = function (conn, buf) {
        var _this = this;
        this._dukProto = new DukDbgProtocol_1.DukDbgProtocol(conn, buf, function (msg) { return _this.dbgLog(msg); });
        this._dukProto.on(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.nfy_status], function (status) {
            if (status.state == 1)
                _this.dbgLog("Status Notification: PAUSE");
            if (!_this._initialStatus) {
                if (_this._awaitingInitialStatus) {
                    _this._initialStatus = status;
                    _this._awaitingInitialStatus = false;
                }
                else {
                    return;
                }
            }
            if (status.state == 1) {
                var sourceFile = _this.mapSourceFile(status.filename);
                if (sourceFile) {
                    var line = _this.convertDebuggerLineToClient(status.linenumber);
                    var pos = sourceFile.generated2Source(line);
                    var bp = _this._breakpoints.find(pos.fileName, pos.line);
                    if (bp)
                        _this._expectingBreak = "breakpoint";
                }
                _this._dbgState.reset();
                _this._dbgState.paused = true;
                _this.sendEvent(new vscode_debugadapter_1.StoppedEvent(_this._expectingBreak, DukDebugSession.THREAD_ID));
                _this._expectingBreak = "debugger";
            }
            else {
                if (_this._dbgState.paused) {
                }
                _this._dbgState.paused = false;
            }
        });
        this._dukProto.once(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.disconnected], function (reason) {
            _this.logToClient("Disconnected: " + (_this._isDisconnecting ? "Client disconnected" : reason) + "\n");
            _this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
        });
        this._dukProto.on(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.nfy_print], function (e) {
            _this.logToClient(e.message, "stdout");
        });
        this._dukProto.on(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.nfy_alert], function (e) {
            _this.logToClient(e.message, "console");
        });
        this._dukProto.on(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.nfy_log], function (e) {
            _this.logToClient(e.message, "stdout");
        });
        this._dukProto.on(DukDbgProtocol_1.DukEvent[DukDbgProtocol_1.DukEvent.nfy_throw], function (e) {
            _this.logToClient("Exception thrown @" + e.fileName + ":" + e.lineNumber + ": " + e.message + "\n", "stderr");
            _this._expectingBreak = "Exception";
        });
    };
    DukDebugSession.prototype.beginInit = function (response) {
        var _this = this;
        this._initialStatus = null;
        this._awaitingInitialStatus = false;
        var conn;
        var args = this._args;
        try {
            var tmOut = args.timeout === undefined ? 10000 : 0;
            conn = DukConnection_1.DukConnection.connect(args.address, args.port, tmOut);
            conn.once("connected", function (buf, version) {
                _this.logToClient("Attached to duktape debugger.\n");
                conn.removeAllListeners();
                _this.logToClient("Protocol ID: " + version.id);
                var proto;
                if (version.major == 2 || (version.major == 1 && version.minor >= 5)) {
                    _this.initDukDbgProtocol(conn, buf);
                    _this.finalizeInit(response);
                }
                else {
                    conn.closeSocket();
                    _this.sendErrorResponse(response, 0, "Unsupported duktape version: " + version.dukVersion);
                }
            });
            conn.once("error", function (err) {
                _this.sendErrorResponse(response, 0, "Attach failed with error: " + err);
            });
        }
        catch (err) {
            this.sendErrorResponse(response, 0, "Failed to perform attach with error: " + err);
        }
    };
    DukDebugSession.prototype.finalizeInit = function (response) {
        var _this = this;
        this.dbgLog("Finalized Initialization.");
        if (this._args.sourceMaps)
            this._sourceMaps = new sourceMaps_1.SourceMaps(this._outDir);
        this._dbgState.reset();
        this._initResponse = null;
        this.removeAllTargetBreakpoints().catch()
            .then(function () {
            _this._awaitingInitialStatus = true;
            if (_this._args.stopOnEntry)
                _this._dukProto.requestPause();
            else
                _this._dukProto.requestResume();
        }).catch();
        this.sendResponse(response);
        this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
    };
    DukDebugSession.prototype.initializeRequest = function (response, args) {
        this.dbgLog("[FE] initializeRequest.");
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsFunctionBreakpoints = false;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        this.sendResponse(response);
    };
    DukDebugSession.prototype.launchRequest = function (response, args) {
        this.dbgLog("[FE] launchRequest");
        this.sendErrorResponse(response, 0, "Launching is not currently supported. Use Attach.");
        return;
        this.dbgLog("Program : " + args.program);
        this.dbgLog("CWD     : " + args.cwd);
        this.dbgLog("Stop On Entry  : " + args.stopOnEntry);
        this._launchType = LaunchType.Launch;
        this._targetProgram = args.program;
        this._sourceRoot = this.normPath(args.cwd);
        this._stopOnEntry = args.stopOnEntry;
    };
    DukDebugSession.prototype.attachRequest = function (response, args) {
        this.dbgLog("[FE] attachRequest");
        if (!args.localRoot || args.localRoot === "") {
            this.sendErrorResponse(response, 0, "Must specify a localRoot`");
            return;
        }
        if (args.sourceMaps && (!args.outDir || args.outDir === "")) {
            this.sendErrorResponse(response, 0, "Must specify an 'outDir' when 'sourceMaps' is enabled.`");
            return;
        }
        this._args = args;
        this._launchType = LaunchType.Attach;
        this._sourceRoot = this.normPath(args.localRoot);
        this._outDir = this.normPath(args.outDir);
        this._dbgLog = args.debugLog || false;
        this.beginInit(response);
    };
    DukDebugSession.prototype.disconnectRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] disconnectRequest");
        this._isDisconnecting = true;
        if (!this._dukProto.isConnected) {
            this.sendResponse(response);
            return;
        }
        var TIMEOUT_MS = 2000;
        var doDisconnect = function () {
            clearTimeout(timeoutID);
            _this._dukProto.disconnect("Client disconnected.");
            _this.sendResponse(response);
        };
        var timeoutID = setTimeout(function () {
            _this.dbgLog("Detach request took too long. Forcefully disconnecting.");
            doDisconnect();
        }, TIMEOUT_MS);
        this._breakpoints._breakpoints = [];
        this.dbgLog("Clearing breakpoints on target.");
        this.removeAllTargetBreakpoints()
            .catch()
            .then(function () {
            var isConnected = _this._dukProto.isConnected;
            ((isConnected && _this._dukProto.requestDetach()) || Promise.resolve())
                .catch()
                .then(function () { return doDisconnect(); });
        })
            .catch();
    };
    DukDebugSession.prototype.setBreakPointsRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] setBreakPointsRequest");
        var filePath = Path.normalize(args.source.path);
        var src = this.unmapSourceFile(filePath);
        if (!src) {
            this.dbgLog("Unknown source file: " + filePath);
            this.sendErrorResponse(response, 0, "SetBreakPoint failed");
            return;
        }
        var inBreaks = args.breakpoints;
        var addBPs = [];
        var remBPs = [];
        var fileBPs = this._breakpoints.getBreakpointsForFile(filePath);
        var successBPs = [];
        var persistBPs = [];
        inBreaks.forEach(function (b) { return b.line = _this.convertClientLineToDebugger(b.line); });
        inBreaks.forEach(function (a) {
            if (ArrayX.firstOrNull(fileBPs, function (b) { return a.line === b.line; }) == null)
                addBPs.push(new DukBreakPoint(filePath, a.line));
        });
        fileBPs.forEach(function (a) {
            if (ArrayX.firstOrNull(inBreaks, function (b) { return a.line === b.line; }) == null)
                remBPs.push(a);
        });
        fileBPs.forEach(function (a) {
            if (!ArrayX.firstOrNull(remBPs, function (b) { return a.line === b.line; }))
                persistBPs.push(a);
        });
        var doRemoveBreakpoints;
        var doAddBreakpoints;
        doRemoveBreakpoints = function (i) {
            if (i >= remBPs.length)
                return Promise.resolve();
            return _this._dukProto.requestRemoveBreakpoint(remBPs[i].dukIdx)
                .catch()
                .then(function () {
                return doRemoveBreakpoints(i + 1);
            });
        };
        doAddBreakpoints = function (i) {
            if (i >= addBPs.length)
                return Promise.resolve();
            var bp = addBPs[i];
            var line = bp.line;
            var generatedName = null;
            if (src.srcMap) {
                var pos = src.source2Generated(filePath, line);
                generatedName = pos.fileName;
                line = pos.line;
            }
            else
                generatedName = _this.getSourceNameByPath(args.source.path) || args.source.name;
            if (!generatedName) {
                return doAddBreakpoints(i + 1);
            }
            return _this._dukProto.requestSetBreakpoint(generatedName, line)
                .then(function (r) {
                successBPs.push(bp);
            })
                .catch()
                .then(function () {
                return doAddBreakpoints(i + 1);
            });
        };
        doRemoveBreakpoints(0)
            .then(function () { return doAddBreakpoints(0); })
            .catch()
            .then(function () {
            _this._breakpoints.removeBreakpoints(remBPs);
            _this._breakpoints.addBreakpoints(successBPs);
            successBPs = persistBPs.concat(successBPs);
            var outBreaks = new Array(successBPs.length);
            for (var i = 0; i < successBPs.length; i++)
                outBreaks[i] = new vscode_debugadapter_1.Breakpoint(true, successBPs[i].line);
            response.body = { breakpoints: outBreaks };
            _this.sendResponse(response);
        });
    };
    DukDebugSession.prototype.setFunctionBreakPointsRequest = function (response, args) {
        this.dbgLog("[FE] setFunctionBreakPointsRequest");
        this.sendResponse(response);
    };
    DukDebugSession.prototype.setExceptionBreakPointsRequest = function (response, args) {
        this.dbgLog("[FE] setExceptionBreakPointsRequest");
        this.sendResponse(response);
    };
    DukDebugSession.prototype.configurationDoneRequest = function (response, args) {
        this.dbgLog("[FE] configurationDoneRequest");
        this.sendResponse(response);
    };
    DukDebugSession.prototype.continueRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] continueRequest");
        if (this._dbgState.paused) {
            this._dukProto.requestResume().then(function (val) {
            }).catch(function (err) {
                _this.requestFailedResponse(response);
            });
            this.sendResponse(response);
        }
        else {
            this.dbgLog("Can't continue when not paused");
            this.requestFailedResponse(response, "Not paused.");
            return;
        }
    };
    DukDebugSession.prototype.nextRequest = function (response, args) {
        this.dbgLog("[FE] nextRequest");
        if (!this._dbgState.paused) {
            this.dbgLog("Can't step over when not paused");
            this.requestFailedResponse(response, "Not paused.");
            return;
        }
        this._expectingBreak = "step";
        this._dukProto.requestStepOver().then(function (val) {
        }).catch(function (err) {
        });
        this.sendResponse(response);
    };
    DukDebugSession.prototype.stepInRequest = function (response, args) {
        this.dbgLog("[FE] stepInRequest");
        if (!this._dbgState.paused) {
            this.dbgLog("Can't step into when not paused");
            this.requestFailedResponse(response, "Not paused.");
            return;
        }
        this._expectingBreak = "stepin";
        this._dukProto.requestStepInto().then(function (val) {
        }).catch(function (err) {
        });
        this.sendResponse(response);
    };
    DukDebugSession.prototype.stepOutRequest = function (response, args) {
        this.dbgLog("[FE] stepOutRequest");
        if (!this._dbgState.paused) {
            this.dbgLog("Can't step out when not paused");
            this.requestFailedResponse(response, "Not paused.");
            return;
        }
        this._expectingBreak = "stepout";
        this._dukProto.requestStepOut().then(function (val) {
        }).catch(function (err) {
        });
        this.sendResponse(response);
    };
    DukDebugSession.prototype.pauseRequest = function (response, args) {
        this.dbgLog("[FE] pauseRequest");
        if (!this._dbgState.paused) {
            this._expectingBreak = "pause";
            this._dukProto.requestPause().then(function (val) {
            }).catch(function (err) {
            });
            this.sendResponse(response);
        }
        else {
            this.dbgLog("Can't paused when already paused.");
            this.requestFailedResponse(response, "Already paused.");
        }
    };
    DukDebugSession.prototype.sourceRequest = function (response, args) {
        this.dbgLog("[FE] sourceRequest");
        var ref = args.sourceReference;
        response.body = { content: "Unknown Source\n" };
        this.sendResponse(response);
    };
    DukDebugSession.prototype.threadsRequest = function (response) {
        this.dbgLog("[FE] threadsRequest");
        response.body = {
            threads: [new vscode_debugadapter_1.Thread(DukDebugSession.THREAD_ID, "Main Thread")]
        };
        this.sendResponse(response);
    };
    DukDebugSession.prototype.stackTraceRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] stackTraceRequest");
        if (!this._dbgState.paused) {
            this.requestFailedResponse(response, "Attempted to obtain stack trace while running.");
            return;
        }
        var getCallStack;
        var dukframes = new Array();
        var doRespond = function () {
            var frames = [];
            frames.length = dukframes.length;
            for (var i = 0, len = frames.length; i < len; i++) {
                var frame = dukframes[i];
                var srcFile = frame.source;
                var src = null;
                if (srcFile)
                    src = new vscode_debugadapter_1.Source(frame.fileName, frame.filePath, 0);
                var klsName = frame.klass == "" ? "" : frame.klass + ".";
                var funcName = frame.funcName == "" ? "(anonymous function)" : frame.funcName + "()";
                frames[i] = new vscode_debugadapter_1.StackFrame(frame.handle, klsName + funcName + " : " + frame.pc, src, frame.lineNumber, frame.pc);
            }
            response.body = { stackFrames: frames };
            _this.sendResponse(response);
        };
        var doApplyConstructors = function (index) {
            if (index >= dukframes.length) {
                doRespond();
                return;
            }
            _this.getObjectConstructorByName("this", dukframes[index].depth)
                .then(function (c) {
                dukframes[index].klass = c;
                doApplyConstructors(index + 1);
            });
        };
        this._dukProto.requestCallStack().then(function (val) {
            dukframes.length = val.callStack.length;
            for (var i = 0, len = dukframes.length; i < len; i++) {
                var entry = val.callStack[i];
                var srcFile = _this.mapSourceFile(entry.fileName);
                var line = _this.convertDebuggerLineToClient(entry.lineNumber);
                var srcPos = srcFile ?
                    srcFile.generated2Source(line) :
                    {
                        path: entry.fileName,
                        fileName: entry.fileName,
                        line: line
                    };
                var frame = new DukStackFrame(srcFile, srcPos.fileName, srcPos.path, entry.funcName, srcPos.line, entry.pc, -i - 1, null);
                frame.handle = _this._dbgState.stackFrames.create(frame);
                dukframes[i] = frame;
            }
            doApplyConstructors(0);
        }).catch(function (err) {
            _this.dbgLog("Stack trace failed: " + err);
            response.body = { stackFrames: [] };
            _this.sendResponse(response);
        });
    };
    DukDebugSession.prototype.scopesRequest = function (response, args) {
        this.dbgLog("[FE] scopesRequest");
        assert(this._dbgState.paused);
        if (!this._args.isMusashi)
            this.scopeRequestForLocals(args.frameId, response, args);
        else
            this.scopeRequestForMultiple(args.frameId, response, args);
    };
    DukDebugSession.prototype.variablesRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] variablesRequest");
        assert(args.variablesReference != 0);
        var properties = this._dbgState.varHandles.get(args.variablesReference);
        if (!properties) {
            response.body = { variables: [] };
            this.sendResponse(response);
            return;
        }
        var scope = properties.scope;
        var stackFrame = scope.stackFrame;
        var returnVars = function (vars) {
            if (properties.type != PropertySetType.Artificials) {
                vars.sort(function (a, b) {
                    var aNum = Number(a.name);
                    var bNum = Number(b.name);
                    var aIsNum = !isNaN(aNum);
                    var bIsNum = !isNaN(bNum);
                    if (!aIsNum && bIsNum)
                        return -1;
                    else if (aIsNum && !bIsNum)
                        return 1;
                    else if (aIsNum && bIsNum) {
                        return aNum < bNum ? -1 :
                            aNum > bNum ? 1 : 0;
                    }
                    if (a.name[0] === "_")
                        return -1;
                    if (b.name[0] === "_")
                        return 1;
                    if (a.name === "this")
                        return -1;
                    if (b.name === "this")
                        return 1;
                    return a.name < b.name ? -1 :
                        a.name > b.name ? 1 : 0;
                });
            }
            response.body = { variables: vars };
            _this.sendResponse(response);
        };
        if (properties.type == PropertySetType.Scope) {
            returnVars(scope.properties.variables);
        }
        else if (properties.type >= PropertySetType.Object) {
            this.expandPropertySubset(properties).then(function (objVars) {
                returnVars(objVars);
            });
        }
    };
    DukDebugSession.prototype.evaluateRequest = function (response, args) {
        var _this = this;
        this.dbgLog("[FE] evaluateRequest");
        var x = args.expression;
        if (x.indexOf("cmd:") == 0) {
            this.handleCommandLine(response, args);
        }
        else {
            var frame_1 = this._dbgState.stackFrames.get(args.frameId);
            if (!frame_1) {
                this.requestFailedResponse(response, "Failed to find stack frame: " + args.frameId);
                return;
            }
            if (!args.expression || args.expression.length < 1) {
                this.requestFailedResponse(response, "Invalid expression");
                return;
            }
            this.dbgLog("Expression: " + args.expression);
            this._dukProto.requestEval(args.expression, frame_1.depth)
                .then(function (resp) {
                var r = resp;
                if (!r.success) {
                    _this.requestFailedResponse(response, "Eval failed: " + r.result);
                    return;
                }
                else {
                    response.body = {
                        result: String(r.result),
                        variablesReference: frame_1.scopes[0].properties.handle
                    };
                    _this.sendResponse(response);
                }
            }).catch(function (err) {
                _this.requestFailedResponse(response, "Eval request failed: " + err);
            });
            return;
        }
    };
    DukDebugSession.prototype.scopeRequestForLocals = function (stackFrameHdl, response, args) {
        var _this = this;
        var stackFrame = this._dbgState.stackFrames.get(stackFrameHdl);
        var dukScope = new DukScope("Local", stackFrame, null);
        dukScope.handle = this._dbgState.scopes.create(dukScope);
        stackFrame.scopes = [dukScope];
        var scopes = [];
        this._dukProto.requestLocalVariables(stackFrame.depth)
            .then(function (r) {
            var keys = ArrayX.convert(r.vars, function (v) { return v.name; });
            return _this.isGlobalObjectByName("this", stackFrame.depth)
                .then(function (isGlobal) {
                if (!isGlobal)
                    keys.unshift("this");
                return _this.expandScopeProperties(keys, dukScope)
                    .then(function (props) {
                    scopes.push(new vscode_debugadapter_1.Scope(props.scope.name, props.handle, false));
                });
            });
        })
            .then(function () {
            response.body = { scopes: scopes };
            _this.sendResponse(response);
        })
            .catch(function (err) {
            _this.dbgLog("scopesRequest (Locals) failed: " + err);
            response.body = { scopes: [] };
        });
    };
    DukDebugSession.prototype.scopeRequestForMultiple = function (stackFrameHdl, response, args) {
        var _this = this;
        var stackFrame = this._dbgState.stackFrames.get(stackFrameHdl);
        var names = ["Local", "Closure", "Global"];
        var dukScopes = new Array(names.length);
        for (var i = 0; i < names.length; i++) {
            var scope = new DukScope(names[i], stackFrame, null);
            scope.handle = this._dbgState.scopes.create(scope);
            dukScopes[i] = scope;
        }
        stackFrame.scopes = dukScopes;
        var scopes = [];
        this._dukProto.requestClosures(this._scopeMask, stackFrame.depth)
            .then(function (r) {
            var keys = [r.local, r.closure, r.global];
            var propPromises = [];
            return _this.isGlobalObjectByName("this", stackFrame.depth)
                .then(function (isGlobal) {
                if (!isGlobal)
                    r.local.unshift("this");
                for (var i = 0; i < names.length; i++) {
                    if (keys[i].length == 0)
                        continue;
                    propPromises.push(_this.expandScopeProperties(keys[i], dukScopes[i]));
                }
                if (propPromises.length > 0) {
                    return Promise.all(propPromises)
                        .then(function (results) {
                        for (var i = 0; i < results.length; i++)
                            scopes.push(new vscode_debugadapter_1.Scope(results[i].scope.name, results[i].handle, results[i].scope.name == "Global"));
                    });
                }
            });
        })
            .then(function () {
            response.body = { scopes: scopes };
            _this.sendResponse(response);
        })
            .catch(function (err) {
            _this.dbgLog("scopesRequest failed: " + err);
            response.body = { scopes: [] };
            _this.sendResponse(response);
        });
    };
    DukDebugSession.prototype.handleCommandLine = function (response, feArgs) {
        var _this = this;
        var x = feArgs.expression;
        var args;
        var cmd;
        var result = "";
        var requireArg = function (i) {
            if (i < 0)
                i = args.length - i;
            if (i < 0 || i >= args.length) {
                throw new Error("Required arg at index " + i);
                return "";
            }
            return args[i];
        };
        var getBool = function (i) {
            var arg = requireArg(i);
            var narg = Number(arg);
            if (!isNaN(narg))
                return narg === 0 ? false : true;
            return Boolean(arg.toLowerCase());
        };
        args = x.substr("cmd:".length).split(" ");
        if (args.length < 1) {
            this.requestFailedResponse(response, "No command");
            return;
        }
        try {
            cmd = requireArg(0);
            args.shift();
            switch (cmd) {
                default:
                    this.requestFailedResponse(response, "Unknown command: " + cmd);
                    return;
                case "breakpoints":
                    {
                        this._dukProto.requestListBreakpoints()
                            .then(function (resp) {
                            var r = resp;
                            _this.dbgLog("Breakpoints: " + r.breakpoints.length);
                            for (var i = 0; i < r.breakpoints.length; i++) {
                                var bp = r.breakpoints[i];
                                var line = ("[" + i + "] " + bp.fileName + ": " + bp.line);
                                _this.dbgLog(line);
                                result += (line + "\n");
                            }
                        }).catch(function (err) {
                            _this.requestFailedResponse(response, "Failed: " + err);
                        });
                    }
                    break;
                case "scopes_globals":
                    var enabled = getBool(0);
                    this.logToClient("Scope Mask: " + (enabled ? 'true' : 'false') + "\n");
                    if (enabled)
                        this._scopeMask |= 4;
                    else
                        this._scopeMask &= (~4);
                    break;
            }
        }
        catch (err) {
            this.requestFailedResponse(response, "Cmd Failed: " + String(err));
            return;
        }
        response.body = {
            result: result,
            variablesReference: 0
        };
        this.sendResponse(response);
    };
    DukDebugSession.prototype.removeAllTargetBreakpoints = function () {
        var _this = this;
        this.dbgLog("removeAllTargetBreakpoints");
        var numBreakpoints = 0;
        return this._dukProto.requestListBreakpoints()
            .then(function (r) {
            numBreakpoints = r.breakpoints.length;
            if (numBreakpoints < 1)
                return Promise.resolve([]);
            var promises = new Array();
            promises.length = numBreakpoints;
            numBreakpoints--;
            for (var i = numBreakpoints; i >= 0; i--)
                promises[i] = _this._dukProto.requestRemoveBreakpoint(numBreakpoints--);
            return Promise.all(promises);
        });
    };
    DukDebugSession.prototype.expandScopeProperties = function (keys, scope) {
        var _this = this;
        var propSet = new PropertySet(PropertySetType.Scope);
        propSet.handle = this._dbgState.varHandles.create(propSet);
        propSet.scope = scope;
        propSet.variables = [];
        scope.properties = propSet;
        var evalPromises = new Array(keys.length);
        for (var i = 0; i < keys.length; i++)
            evalPromises[i] = this._dukProto.requestEval(keys[i], scope.stackFrame.depth);
        return Promise.all(evalPromises)
            .then(function (results) {
            var ctorPromises = [];
            var objVars = [];
            var pKeys = [];
            var pValues = [];
            for (var i = 0; i < results.length; i++) {
                if (!results[i].success)
                    continue;
                pKeys.push(keys[i]);
                pValues.push(results[i].result);
            }
            if (pKeys.length < 1)
                return propSet;
            return _this.resolvePropertySetVariables(pKeys, pValues, propSet);
        })
            .catch(function (err) {
            return propSet;
        });
    };
    DukDebugSession.prototype.expandPropertySubset = function (propSet) {
        var _this = this;
        if (propSet.type == PropertySetType.Object) {
            if (propSet.variables)
                return Promise.resolve(propSet.variables);
            propSet.variables = [];
            return this._dukProto.requestInspectHeapObj(propSet.heapPtr)
                .then(function (r) {
                var numArtificial = r.properties.length;
                var props = r.properties;
                var artificials = new PropertySet(PropertySetType.Artificials);
                artificials.handle = _this._dbgState.varHandles.create(artificials);
                artificials.scope = propSet.scope;
                artificials.variables = new Array(numArtificial);
                for (var i = 0; i < numArtificial; i++) {
                    var p = r.properties[i];
                    artificials.variables[i] = new vscode_debugadapter_1.Variable(p.key, String(p.value), 0);
                }
                propSet.variables.push(new vscode_debugadapter_1.Variable("__artificial", "{...}", artificials.handle));
                var maxOwnProps = r.maxPropDescRange;
                if (maxOwnProps < 1)
                    return propSet.variables;
                return _this._dukProto.requestGetObjPropDescRange(propSet.heapPtr, 0, maxOwnProps)
                    .then(function (r) {
                    var props = [];
                    for (var i = 0; i < r.properties.length; i++) {
                        if (r.properties[i].value !== undefined)
                            props.push(r.properties[i]);
                    }
                    return _this.resolvePropertySetVariables(ArrayX.convert(props, function (v) { return String(v.key); }), ArrayX.convert(props, function (v) { return v.value; }), propSet)
                        .then(function (p) { return propSet.variables; });
                });
            });
        }
        else if (propSet.type == PropertySetType.Artificials) {
            return Promise.resolve(propSet.variables);
        }
        return Promise.resolve([]);
    };
    DukDebugSession.prototype.resolvePropertySetVariables = function (keys, values, propSet) {
        var _this = this;
        var scope = propSet.scope;
        var stackDepth = scope.stackFrame.depth;
        var objClassPromises = [];
        var toStrPromises = [];
        var objVars = [];
        if (!propSet.variables)
            propSet.variables = [];
        var _loop_1 = function (i) {
            var key = keys[i];
            var value = values[i];
            var variable = new vscode_debugadapter_1.Variable(key, "", 0);
            propSet.variables.push(variable);
            if (value instanceof Duk.TValObject) {
                var ptrStr = (value.ptr).toString();
                var objPropSet_1 = this_1._dbgState.ptrHandles[ptrStr];
                if (objPropSet_1) {
                    variable.variablesReference = objPropSet_1.handle;
                    if (objPropSet_1.displayName) {
                        variable.value = objPropSet_1.displayName;
                        return "continue";
                    }
                }
                else {
                    objPropSet_1 = new PropertySet(PropertySetType.Object);
                    objPropSet_1.scope = scope;
                    objPropSet_1.heapPtr = value.ptr;
                    objPropSet_1.classType = value.classID;
                    objPropSet_1.displayName = "Object";
                    variable.value = objPropSet_1.displayName;
                    objPropSet_1.handle = this_1._dbgState.varHandles.create(objPropSet_1);
                    variable.variablesReference = objPropSet_1.handle;
                    this_1._dbgState.ptrHandles[ptrStr] = objPropSet_1;
                    objPromise = this_1._dukProto.requestInspectHeapObj(objPropSet_1.heapPtr)
                        .then(function (r) {
                        var clsName = ArrayX.firstOrNull(r.properties, function (v) { return v.key === "class_name"; });
                        if (!clsName || clsName.value === "Object") {
                            toStrPromises.push(_this.getConstructorNameByObject(objPropSet_1.heapPtr));
                            objVars.push(variable);
                        }
                        else {
                            objPropSet_1.displayName = clsName.value;
                            variable.value = objPropSet_1.displayName;
                        }
                    });
                    objClassPromises.push(objPromise);
                }
            }
            else {
                variable.value = typeof value === "string" ? "\"" + value + "\"" : String(value);
            }
        };
        var this_1 = this, objPromise;
        for (var i = 0; i < keys.length; i++) {
            _loop_1(i);
        }
        return Promise.all(objClassPromises)
            .then(function () {
            return Promise.all(toStrPromises)
                .then(function (toStrResults) {
                var ctorRequests = [];
                var ctorVars = [];
                for (var i = 0; i < toStrResults.length; i++) {
                    var rName = toStrResults[i];
                    _this._dbgState.varHandles.get(objVars[i].variablesReference).displayName = rName;
                    objVars[i].value = rName;
                }
                if (ctorRequests.length > 0) {
                    return Promise.all(ctorRequests)
                        .then(function (ctorNameResp) {
                        for (var i = 0; i < ctorNameResp.length; i++) {
                            if (ctorNameResp[i].success)
                                ctorVars[i].value = ctorNameResp[i].result;
                        }
                        return Promise.resolve(propSet);
                    });
                }
                return Promise.resolve(propSet);
            });
        })
            .catch()
            .then(function () {
            return Promise.resolve(propSet);
        });
    };
    DukDebugSession.prototype.getObjectConstructorByName = function (prefix, stackDepth) {
        var _this = this;
        var exp = "(" + prefix + '.constructor.toString().match(/\\w+/g)[1])';
        return this.isGlobalObjectByName(prefix, stackDepth)
            .then(function (isGlobal) {
            if (isGlobal)
                return "";
            return _this._dukProto.requestEval(exp, stackDepth)
                .then(function (resp) {
                var r = resp;
                return r.success ? String(r.result) : "";
            });
        }).catch(function (err) { return ""; });
    };
    DukDebugSession.prototype.getConstructorNameByObject = function (ptr) {
        var _this = this;
        var protoPtr;
        return this._dukProto.requestInspectHeapObj(ptr)
            .then(function (r) {
            var p = ArrayX.firstOrNull(r.properties, function (n) { return n.key === "prototype"; });
            protoPtr = p.value.ptr;
            return _this._dukProto.requestInspectHeapObj(protoPtr);
        })
            .then(function (r) {
            return _this._dukProto.requestGetObjPropDescRange(protoPtr, 0, r.maxPropEntriesRange);
        })
            .then(function (r) {
            var p = ArrayX.firstOrNull(r.properties, function (n) { return n.key === "constructor"; });
            var obj = p.value;
            return _this._dukProto.requestGetObjPropDescRange(p.value.ptr, 0, 0x7fffffff);
        })
            .then(function (r) {
            var p = ArrayX.firstOrNull(r.properties, function (n) { return n.key === "name"; });
            return p.value;
        })
            .catch(function (err) {
            var errStr = String(err);
            _this.dbgLog(errStr);
            return "Object";
        });
    };
    DukDebugSession.prototype.isGlobalObjectByName = function (prefix, stackDepth) {
        var exp = "String(" + prefix + ")";
        return this._dukProto.requestEval(exp, stackDepth)
            .then(function (resp) {
            var r = resp;
            if (!r.success)
                return Promise.reject("failed");
            else {
                var isglob = r.result === "[object global]" ? true : false;
                return isglob;
            }
        }, function (err) { Promise.reject(err); });
    };
    DukDebugSession.prototype.mapSourceFile = function (name) {
        if (!name)
            return null;
        name = this.normPath(name);
        var sources = this._sources;
        for (var k in sources) {
            var val = sources[k];
            if (val.name == name)
                return val;
        }
        var fpath;
        if (this._args.sourceMaps)
            fpath = this.normPath(Path.join(this._outDir, name));
        else
            fpath = this.normPath(Path.join(this._sourceRoot, name));
        if (!FS.existsSync(fpath))
            return null;
        var src = new SourceFile();
        src.id = this._nextSourceID++;
        src.name = name;
        src.path = fpath;
        sources[src.id] = src;
        sources[src.name] = src;
        try {
            this.checkForSourceMap(src);
            if (src.srcMap) {
                var srcMap = src.srcMap;
                for (var i = 0; i < srcMap._sources.length; i++) {
                    var srcPath = srcMap._sources[i];
                    if (!Path.isAbsolute(srcPath))
                        srcPath = Path.join(this._sourceRoot, srcPath);
                    srcPath = Path.normalize(srcPath);
                    this._sourceToGen[srcPath] = src;
                }
            }
        }
        catch (err) { }
        return src;
    };
    DukDebugSession.prototype.unmapSourceFile = function (path) {
        var _this = this;
        path = Path.normalize(path);
        var name = Path.basename(path);
        var pathUnderRoot = Path.dirname(this.getSourceNameByPath(path) || "");
        if (!this._sourceMaps)
            return this.mapSourceFile(Path.join(pathUnderRoot, name));
        var src2gen = this._sourceToGen;
        if (src2gen[path])
            return src2gen[path];
        var src = null;
        var scanDir = function (dirPath, rootPath) {
            var files;
            try {
                files = FS.readdirSync(dirPath);
            }
            catch (err) {
                return;
            }
            files = files.filter(function (f) { return Path.extname(f).toLocaleLowerCase() === ".js"; });
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                var stat = FS.lstatSync(Path.join(dirPath, f));
                if (stat.isDirectory())
                    continue;
                src = _this.mapSourceFile(Path.join(rootPath, f));
                if (src)
                    return src;
            }
        };
        var outDirToScan = Path.join(this._outDir, pathUnderRoot);
        return scanDir(outDirToScan, pathUnderRoot) || scanDir(this._outDir, "");
    };
    DukDebugSession.prototype.checkForSourceMap = function (src) {
        if (!this._args.sourceMaps)
            return;
        src.srcMap = this._sourceMaps.MapPathFromSource(src.path);
        src.srcMapPath = src.srcMap.generatedPath();
    };
    DukDebugSession.prototype.getSourceNameByPath = function (fpath) {
        fpath = this.normPath(fpath);
        if (fpath.indexOf(this._sourceRoot) != 0)
            return undefined;
        return fpath.substr(this._sourceRoot.length + 1);
    };
    DukDebugSession.prototype.requestFailedResponse = function (response, msg) {
        msg = msg ? msg.toString() : "";
        msg = "Request failed: " + msg;
        this.dbgLog("ERROR: " + msg);
        this.sendErrorResponse(response, ErrorCode.RequestFailed, msg);
    };
    DukDebugSession.prototype.normPath = function (fpath) {
        if (!fpath)
            fpath = "";
        fpath = Path.normalize(fpath);
        fpath = fpath.replace(/\\/g, '/');
        return fpath;
    };
    DukDebugSession.prototype.logToClient = function (msg, category) {
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(msg, category));
        console.log(msg);
    };
    DukDebugSession.prototype.dbgLog = function (msg) {
        if (this._dbgLog && msg && msg.length > 0) {
            var buf = new Buffer(msg);
            for (var i = 0, len = buf.length; i < len; i++)
                if (buf[i] > 0x7F)
                    buf[i] = 0x3F;
            msg = buf.toString('utf8');
            this.sendEvent(new vscode_debugadapter_1.OutputEvent(msg + "\n"));
            console.log(msg);
        }
    };
    return DukDebugSession;
}(vscode_debugadapter_1.DebugSession));
DukDebugSession.THREAD_ID = 1;
vscode_debugadapter_1.DebugSession.run(DukDebugSession);
