/**
 * 48co Preload Script
 * Bridges the renderer (UI) with the main process securely.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('foureightco', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),

  // Recording events (renderer → main)
  sendTranscription: (text) => ipcRenderer.send('transcription-ready', text),
  sendError: (error) => ipcRenderer.send('transcription-error', error),

  // State events (main → renderer)
  onRecordingState: (callback) => {
    ipcRenderer.on('recording-state', (_, data) => callback(data))
  },
  onStartRecording: (callback) => {
    ipcRenderer.on('start-recording', (_, config) => callback(config))
  },
  onStopRecording: (callback) => {
    ipcRenderer.on('stop-recording', () => callback())
  },
})
