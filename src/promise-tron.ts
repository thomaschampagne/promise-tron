import * as Electron from 'electron'

/**
 * PromiseTron is a promise based communication system which simplify data exchange between electron main
 * and renderer processes
 * @author Thomas Champagne
 * @licence MIT
 */
export class PromiseTron {
  public static readonly REQUEST_FROM_RENDERER: string = 'promise-tron-request-from-renderer'
  public static readonly REQUEST_FROM_MAIN: string = 'promise-tron-request-from-main'
  public static readonly RESPONSE_TO_RENDERER: string = 'promise-tron-response-to-renderer'
  public static readonly RESPONSE_TO_MAIN: string = 'promise-tron-response-to-main'

  public readonly ipcMain: Electron.IpcMain
  public readonly ipcRenderer: Electron.IpcRenderer
  public readonly webContents: Electron.WebContents | null
  public readonly isRenderer: boolean
  public readonly isMain: boolean
  public readonly logger: any

  /**
   * Instantiate PromiseTron
   * @param ipc Pass IpcMain or IpcRenderer
   * @param webContents Pass the webContents object of your BrowserWindow if you're on main thread
   */
  constructor(ipc: Electron.IpcMain | Electron.IpcRenderer, webContents?: Electron.WebContents) {
    this.isRenderer = PromiseTron.isProcessRenderer()
    this.isMain = !this.isRenderer
    this.ipcMain = (this.isRenderer ? null : ipc) as Electron.IpcMain
    this.ipcRenderer = (this.isRenderer ? ipc : null) as Electron.IpcRenderer
    this.webContents = webContents ? webContents : null
    if (this.isMain && webContents === null) {
      throw new Error('You are in main mode: please pass Electron.WebContents in constructor')
    }
  }

  /**
   * Tells if your are running into a renderer process. If false, you are in main process
   */
  public static isProcessRenderer(): boolean {
    // node-integration is disabled
    if (!process) {
      return true
    }

    // We're in node.js somehow
    if (!process.type) {
      return false
    }

    return process.type === 'renderer'
  }

  /**
   * Generate a random unique identifier
   * @param length
   */
  public static genId(length?: number): string {
    length = length && length > 0 ? length : 16
    return ((Math.random() * Date.now()).toString(36) + Math.random().toString(36))
      .replace(/\./g, '')
      .slice(0, length)
  }

  /**
   * Listen for {IpcRequest} from main thread if on a renderer thread
   * Listen for {IpcRequest} from renderer thread if on a main thread
   * @param onRequest Callback which provides incoming {IpcRequest} and replyWith function
   */
  public on(
    onRequest: (
      request: IpcRequest,
      replyWith: (promiseTronReply: PromiseTronReply) => void
    ) => void
  ): void {
    if (this.isMain) {
      this.ipcMain.on(
        PromiseTron.REQUEST_FROM_RENDERER,
        (event: Electron.Event, request: IpcRequest) => {
          onRequest(request, (promiseTronReply: PromiseTronReply) => {
            event.sender.send(request.responseId, promiseTronReply)
          })
        }
      )
    } else if (this.isRenderer) {
      this.ipcRenderer.on(
        PromiseTron.REQUEST_FROM_MAIN,
        (event: Electron.Event, request: IpcRequest) => {
          onRequest(request, (promiseTronReply: PromiseTronReply) => {
            event.sender.send(request.responseId, promiseTronReply)
          })
        }
      )
    }
  }

  /**
   * Send data to ipcMain if called from a renderer thread
   * Send data to ipcRenderer if called from main thread
   * @param data
   * @return Promise of expected result
   */
  public send(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isMain && this.webContents) {
        const responseId = PromiseTron.RESPONSE_TO_MAIN + '-' + PromiseTron.genId()

        // Send the request
        this.ipcMain.once(
          responseId,
          (event: Electron.Event, promiseTronReply: PromiseTronReply) => {
            if (promiseTronReply.error) {
              reject(promiseTronReply.error)
            } else {
              resolve(promiseTronReply.success)
            }
          }
        )

        this.webContents.send(PromiseTron.REQUEST_FROM_MAIN, new IpcRequest(responseId, data))
      } else if (this.isRenderer) {
        // Generate a unique response channel
        const responseId = PromiseTron.RESPONSE_TO_RENDERER + '-' + PromiseTron.genId()

        // Wait for response on channel
        this.ipcRenderer.once(
          responseId,
          (event: Electron.Event, promiseTronReply: PromiseTronReply) => {
            if (promiseTronReply.error) {
              reject(promiseTronReply.error)
            } else {
              resolve(promiseTronReply.success)
            }
          }
        )

        // Send the request
        this.ipcRenderer.send(PromiseTron.REQUEST_FROM_RENDERER, new IpcRequest(responseId, data))
      }
    })
  }
}

export class PromiseTronReply {
  public success: any
  public error: any
}

/**
 * Object used to track communications between IpcMain & IpcRenderer
 */
export class IpcRequest {
  /**
   * Extract object from IpcRequest data
   * @return T
   */
  public static extractData<T>(request: IpcRequest): T | null {
    if (request.data) {
      return request.data as T
    }

    return null
  }

  /**
   * Response identifier used by IpcMain to reply to IpcRenderer (or IpcRenderer to IpcMain)
   */
  public responseId: string

  /**
   * Request payload
   */
  public data: any

  /**
   *
   * @param responseId Response identifier associated to this request
   * @param data Request payload
   */
  constructor(responseId: string, data: any) {
    this.responseId = responseId
    this.data = data
  }
}
