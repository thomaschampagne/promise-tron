# Promise tron
PromiseTron is a promise based communication system library which simplify data exchange between electron main and renderer processes.

PromiseTron includes **typescript** definitions.

Api doc: [https://thomaschampagne.github.io/promise-tron/](https://thomaschampagne.github.io/promise-tron/)

## Install

```bash
npm install promise-tron --save
```

or

```bash
git clone https://github.com/thomaschampagne/promise-tron
cd promise-tron
npm install
npm run build
```

## Usage

### Message from ipcRenderer to ipcMain

```javascript

import { BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { PromiseTron } from "promise-tron";

// Renderer
const promiseTronRenderer = new PromiseTron(ipcRenderer);
promiseTronRenderer.send('Hi from renderer!').then(response => {
  console.log(response); // Prints: "Reply from ipcMain"
}, error => {
  console.error(error);
});

// Main
const browserWindow = new BrowserWindow();
const promiseTronMain = new PromiseTron(ipcMain, browserWindow.webContents);
promiseTronMain.on((request /*IpcRequest*/, replyWith /*(promiseTronReply: PromiseTronReply) => void*/) => {
  console.log(request.data); // Prints: "Hi from renderer!"
  replyWith({
    success: 'Reply from ipcMain',
    error: null
  });
});

```

### Message from ipcMain to ipcRenderer

```javascript
import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { PromiseTron } from 'promise-tron'

// Main
const browserWindow = new BrowserWindow();
const promiseTronMain = new PromiseTron(ipcMain, browserWindow.webContents);
promiseTronMain.send('Hi from main!').then(response => {
  console.log(response); // Prints: "Reply from ipcRenderer"
}, error => {
  console.error(error);
});


// Renderer
const promiseTronRenderer = new PromiseTron(ipcRenderer);
promiseTronRenderer.on((request /*IpcRequest*/, replyWith /*(promiseTronReply: PromiseTronReply) => void*/) => {
  console.log(request.data); // Prints: "Hi from main!"
  replyWith({
    success: 'Reply from ipcRenderer',
    error: null
  });
});
```

## NPM scripts

 - `npm test`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)
