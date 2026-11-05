// CommonJS, because a sandboxed preload cannot be an ES module.
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  setTheme: (source) => ipcRenderer.invoke('theme:set', source),
  pathForFile: (file) => webUtils.getPathForFile(file)
});
