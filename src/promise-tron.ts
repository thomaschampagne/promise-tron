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
   *
   */
  public on(onRequest: (request: IpcRequest, reply: (result: any) => any) => void): void {

    if (this.isMain) {

      this.ipcMain.on(PromiseTron.REQUEST_FROM_RENDERER, (event: Electron.Event, request: IpcRequest) => {
        onRequest(request, result => {
          event.sender.send(request.responseId, result)
        })
      })

    } else if (this.isRenderer) {
      this.ipcRenderer.on(PromiseTron.REQUEST_FROM_MAIN, (event: Electron.Event, request: IpcRequest) => {
        onRequest(request, result => {
          event.sender.send(request.responseId, result)
        })
      })
    }
  }

  /**
   * Send data to ipcMain if called from a renderer thread
   * Send data to ipcRenderer if called from main thread
   * @param data
   * @return Promise of expected result type <R>
   */
  public send<R>(data: any): Promise<R> {

    return new Promise((resolve, reject) => {

      if (this.isMain && this.webContents) {

        const responseId = PromiseTron.RESPONSE_TO_MAIN + '-' + PromiseTron.genId()

        // Send the request
        this.ipcMain.once(responseId, (event: Electron.Event, result: any) => {
          resolve(result)
        })

        this.webContents.send(PromiseTron.REQUEST_FROM_MAIN, new IpcRequest(responseId, data))

      } else if (this.isRenderer) {

        // Generate a unique response channel
        const responseId = PromiseTron.RESPONSE_TO_RENDERER + '-' + PromiseTron.genId()

        // Wait for response on channel
        this.ipcRenderer.once(responseId, (event: Electron.Event, result: R) => {
          resolve(result)
        })

        // Send the request
        this.ipcRenderer.send(PromiseTron.REQUEST_FROM_RENDERER, new IpcRequest(responseId, data))
      }
    })
  }
}

export class IpcRequest {
  public responseId: string
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
