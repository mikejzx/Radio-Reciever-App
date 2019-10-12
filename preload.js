
// Fixes zoom level on startup.
// https://github.com/electron/electron/issues/10572

process.once('loaded', () => {
    global.electron = require('electron')
    electron.webFrame.setZoomFactor(1.0)
})