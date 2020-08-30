"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcRequest = exports.PromiseTronReply = exports.PromiseTron = void 0;
/**
 * PromiseTron is a promise based communication system which simplify data exchange between electron main
 * and renderer processes
 * @author Thomas Champagne
 * @licence MIT
 */
class PromiseTron {
    /**
     * Instantiate PromiseTron
     * @param ipc Pass IpcMain or IpcRenderer
     * @param webContents Pass the webContents object of your BrowserWindow if you're on main thread
     */
    constructor(ipc, webContents) {
        this.isRenderer = PromiseTron.isProcessRenderer();
        this.isMain = !this.isRenderer;
        this.ipcMain = (this.isRenderer ? null : ipc);
        this.ipcRenderer = (this.isRenderer ? ipc : null);
        this.webContents = webContents ? webContents : null;
        if (this.isMain && webContents === null) {
            throw new Error('You are in main mode: please pass WebContents in constructor');
        }
    }
    /**
     * Tells if your are running into a renderer process. If false, you are in main process
     */
    static isProcessRenderer() {
        // node-integration is disabled
        if (!process) {
            return true;
        }
        // We're in node.js somehow
        if (!process.type) {
            return false;
        }
        return process.type === 'renderer';
    }
    /**
     * Listen for {IpcRequest} from main thread if on a renderer thread
     * Listen for {IpcRequest} from renderer thread if on a main thread
     * @param onRequest Callback which provides incoming {IpcRequest} and replyWith function
     */
    on(onRequest) {
        if (this.isMain) {
            this.ipcMain.handle(PromiseTron.REQUEST_FROM_RENDERER, (event, request) => {
                return new Promise(resolve => {
                    onRequest(request, (promiseTronReply) => {
                        resolve(promiseTronReply);
                    });
                });
            });
        }
        else if (this.isRenderer) {
            this.ipcRenderer.on(PromiseTron.REQUEST_FROM_MAIN, (event, request) => {
                onRequest(request, (promiseTronReply) => {
                    event.sender.send(request.responseId, promiseTronReply);
                });
            });
        }
    }
    /**
     * Send data to ipcMain if called from a renderer thread
     * Send data to ipcRenderer if called from main thread
     * @param data
     * @return Promise of expected result
     */
    send(data) {
        return new Promise((resolve, reject) => {
            if (this.isMain && this.webContents) {
                const ipcRequest = new IpcRequest(data);
                // Set the callback
                this.ipcMain.once(ipcRequest.responseId, (event, promiseTronReply) => {
                    if (promiseTronReply.error) {
                        reject(promiseTronReply.error);
                    }
                    else {
                        resolve(promiseTronReply.success);
                    }
                });
                // Send the request
                this.webContents.send(PromiseTron.REQUEST_FROM_MAIN, ipcRequest);
            }
            else if (this.isRenderer) {
                this.ipcRenderer
                    .invoke(PromiseTron.REQUEST_FROM_RENDERER, new IpcRequest(data))
                    .then((promiseTronReply) => {
                    if (promiseTronReply.error) {
                        reject(promiseTronReply.error);
                    }
                    else {
                        resolve(promiseTronReply.success);
                    }
                })
                    .catch(err => {
                    reject(err);
                });
            }
        });
    }
}
exports.PromiseTron = PromiseTron;
PromiseTron.REQUEST_FROM_RENDERER = 'promise-tron-request-from-renderer';
PromiseTron.REQUEST_FROM_MAIN = 'promise-tron-request-from-main';
PromiseTron.RESPONSE_TO_RENDERER = 'promise-tron-response-to-renderer';
PromiseTron.RESPONSE_TO_MAIN = 'promise-tron-response-to-main';
class PromiseTronReply {
}
exports.PromiseTronReply = PromiseTronReply;
/**
 * Object used to track communications between IpcMain & IpcRenderer
 */
class IpcRequest {
    /**
     *
     * @param data Request payload
     */
    constructor(data) {
        IpcRequest.GLOBAL_REQUEST_CREATED_COUNT++;
        this.responseId = IpcRequest.GLOBAL_REQUEST_CREATED_COUNT.toString();
        this.data = data;
    }
    /**
     * Extract object from IpcRequest data
     * @return T
     */
    static extractData(request) {
        if (request.data) {
            return request.data;
        }
        return null;
    }
}
exports.IpcRequest = IpcRequest;
IpcRequest.GLOBAL_REQUEST_CREATED_COUNT = 0;
//# sourceMappingURL=promise-tron.js.map