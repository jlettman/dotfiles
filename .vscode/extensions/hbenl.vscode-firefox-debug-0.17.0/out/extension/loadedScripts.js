"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class LoadedScriptsProvider {
    constructor() {
        this.root = new RootTreeItem();
        this.treeDataChanged = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.treeDataChanged.event;
    }
    getTreeItem(node) {
        return node;
    }
    getChildren(node) {
        let parent = (node || this.root);
        return parent.getChildren();
    }
    addSession(session) {
        let changedItem = this.root.addSession(session);
        this.sendTreeDataChangedEvent(changedItem);
    }
    removeSession(sessionId) {
        let changedItem = this.root.removeSession(sessionId);
        this.sendTreeDataChangedEvent(changedItem);
    }
    addThread(threadInfo, sessionId) {
        let changedItem = this.root.addThread(threadInfo, sessionId);
        this.sendTreeDataChangedEvent(changedItem);
    }
    removeThread(threadId, sessionId) {
        let changedItem = this.root.removeThread(threadId, sessionId);
        this.sendTreeDataChangedEvent(changedItem);
    }
    addSource(sourceInfo, sessionId) {
        let changedItem = this.root.addSource(sourceInfo, sessionId);
        this.sendTreeDataChangedEvent(changedItem);
    }
    removeSources(threadId, sessionId) {
        let changedItem = this.root.removeSources(threadId, sessionId);
        this.sendTreeDataChangedEvent(changedItem);
    }
    sendTreeDataChangedEvent(changedItem) {
        if (changedItem) {
            if (changedItem === this.root) {
                this.treeDataChanged.fire();
            }
            else {
                this.treeDataChanged.fire(changedItem);
            }
        }
    }
}
exports.LoadedScriptsProvider = LoadedScriptsProvider;
class SourceTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(label, collapsibleState);
    }
}
class RootTreeItem extends SourceTreeItem {
    constructor() {
        super('');
        this.children = [];
        this.showSessions = false;
    }
    addSession(session) {
        if (!this.children.some((child) => (child.id === session.id))) {
            let index = this.children.findIndex((child) => (child.label > session.name));
            if (index < 0)
                index = this.children.length;
            this.children.splice(index, 0, new SessionTreeItem(session));
            return this;
        }
        else {
            return undefined;
        }
    }
    removeSession(sessionId) {
        this.children = this.children.filter((child) => (child.id !== sessionId));
        return this;
    }
    addThread(threadInfo, sessionId) {
        let sessionItem = this.children.find((child) => (child.id === sessionId));
        return sessionItem ? this.fixChangedItem(sessionItem.addThread(threadInfo)) : undefined;
    }
    removeThread(threadId, sessionId) {
        let sessionItem = this.children.find((child) => (child.id === sessionId));
        return sessionItem ? this.fixChangedItem(sessionItem.removeThread(threadId)) : undefined;
    }
    addSource(sourceInfo, sessionId) {
        let sessionItem = this.children.find((child) => (child.id === sessionId));
        return sessionItem ? this.fixChangedItem(sessionItem.addSource(sourceInfo)) : undefined;
    }
    removeSources(threadId, sessionId) {
        let sessionItem = this.children.find((child) => (child.id === sessionId));
        return sessionItem ? this.fixChangedItem(sessionItem.removeSources(threadId)) : undefined;
    }
    getChildren() {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        if (this.showSessions || (this.children.length > 1)) {
            this.showSessions = true;
            return this.children;
        }
        else if (this.children.length == 1) {
            return this.children[0].getChildren();
        }
        else {
            return [];
        }
    }
    fixChangedItem(changedItem) {
        if (!changedItem)
            return undefined;
        if (!this.showSessions && (changedItem instanceof SessionTreeItem)) {
            return this;
        }
        else {
            return changedItem;
        }
    }
}
class SessionTreeItem extends SourceTreeItem {
    constructor(session) {
        super(session.name);
        this.session = session;
        this.children = [];
        this.showThreads = false;
    }
    get id() {
        return this.session.id;
    }
    addThread(threadInfo) {
        if (!this.children.some((child) => (child.id === threadInfo.id))) {
            let index = this.children.findIndex((child) => (child.label > threadInfo.name));
            if (index < 0)
                index = this.children.length;
            this.children.splice(index, 0, new ThreadTreeItem(threadInfo));
            return this;
        }
        else {
            return undefined;
        }
    }
    removeThread(threadId) {
        this.children = this.children.filter((child) => (child.id !== threadId));
        return this;
    }
    addSource(sourceInfo) {
        if (!sourceInfo.url)
            return undefined;
        let threadItem = this.children.find((child) => (child.id === sourceInfo.threadId));
        if (threadItem) {
            let path = splitURL(sourceInfo.url);
            let filename = path.pop();
            return this.fixChangedItem(threadItem.addSource(filename, path, sourceInfo, this.id));
        }
        else {
            return undefined;
        }
    }
    removeSources(threadId) {
        let threadItem = this.children.find((child) => (child.id === threadId));
        return threadItem ? threadItem.removeSources() : undefined;
    }
    getChildren() {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        if (this.showThreads || (this.children.length > 1)) {
            this.showThreads = true;
            return this.children;
        }
        else if (this.children.length == 1) {
            return this.children[0].getChildren();
        }
        else {
            return [];
        }
    }
    fixChangedItem(changedItem) {
        if (!changedItem)
            return undefined;
        if (!this.showThreads && (changedItem instanceof ThreadTreeItem)) {
            return this;
        }
        else {
            return changedItem;
        }
    }
}
class NonLeafSourceTreeItem extends SourceTreeItem {
    constructor(label) {
        super(label);
        this.children = [];
    }
    addSource(filename, path, sourceInfo, sessionId) {
        if (path.length === 0) {
            this.addChild(new SourceFileTreeItem(filename, sourceInfo, sessionId));
            return this;
        }
        let itemIndex = this.children.findIndex((item) => ((item instanceof SourceDirectoryTreeItem) && (item.path[0] === path[0])));
        if (itemIndex < 0) {
            let directoryItem = new SourceDirectoryTreeItem(path);
            directoryItem.addSource(filename, [], sourceInfo, sessionId);
            this.addChild(directoryItem);
            return this;
        }
        let item = this.children[itemIndex];
        let pathMatchLength = path.findIndex((pathElement, index) => ((index >= item.path.length) || (item.path[index] !== pathElement)));
        if (pathMatchLength < 0)
            pathMatchLength = path.length;
        let pathRest = path.slice(pathMatchLength);
        if (pathMatchLength === item.path.length) {
            return item.addSource(filename, pathRest, sourceInfo, sessionId);
        }
        item.split(pathMatchLength);
        item.addSource(filename, pathRest, sourceInfo, sessionId);
        return this;
    }
    getChildren() {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        return this.children;
    }
    addChild(newChild) {
        let index;
        if (newChild instanceof SourceDirectoryTreeItem) {
            index = this.children.findIndex((child) => !((child instanceof SourceDirectoryTreeItem) && (child.label < newChild.label)));
        }
        else {
            index = this.children.findIndex((child) => (child instanceof SourceFileTreeItem) && (child.label >= newChild.label));
        }
        if (index >= 0) {
            if (this.children[index].label !== newChild.label) {
                this.children.splice(index, 0, newChild);
            }
        }
        else {
            this.children.push(newChild);
        }
    }
}
class ThreadTreeItem extends NonLeafSourceTreeItem {
    constructor(threadInfo) {
        super(threadInfo.name);
        this.id = threadInfo.id;
    }
    removeSources() {
        this.children = [];
        return this;
    }
}
class SourceDirectoryTreeItem extends NonLeafSourceTreeItem {
    constructor(path) {
        super(path.join('/'));
        this.path = path;
    }
    split(atIndex) {
        let newChild = new SourceDirectoryTreeItem(this.path.slice(atIndex));
        newChild.children = this.children;
        this.path.splice(atIndex);
        this.children = [newChild];
        this.label = this.path.join('/');
    }
}
class SourceFileTreeItem extends SourceTreeItem {
    constructor(filename, sourceInfo, sessionId) {
        super((filename.length > 0) ? filename : '(index)', vscode.TreeItemCollapsibleState.None);
        let pathOrUri;
        if (sourceInfo.path) {
            pathOrUri = sourceInfo.path;
        }
        else {
            pathOrUri = `debug:${encodeURIComponent(sourceInfo.url)}?session=${encodeURIComponent(sessionId)}&ref=${sourceInfo.sourceId}`;
        }
        this.command = {
            command: 'extension.firefox.openScript',
            arguments: [pathOrUri],
            title: ''
        };
    }
    getChildren() {
        return [];
    }
}
function splitURL(urlString) {
    let originLength;
    let i = urlString.indexOf(':');
    if (i >= 0) {
        i++;
        if (urlString[i] === '/')
            i++;
        if (urlString[i] === '/')
            i++;
        originLength = urlString.indexOf('/', i);
    }
    else {
        originLength = 0;
    }
    let searchStartIndex = urlString.indexOf('?', originLength);
    if (searchStartIndex < 0) {
        searchStartIndex = urlString.length;
    }
    let origin = urlString.substr(0, originLength);
    let search = urlString.substr(searchStartIndex);
    let path = urlString.substring(originLength, searchStartIndex);
    let result = path.split('/');
    result[0] = origin + result[0];
    result[result.length - 1] += search;
    return result;
}
//# sourceMappingURL=loadedScripts.js.map