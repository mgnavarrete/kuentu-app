// Programa de escritorio de Kuentu (Windows, Mac, Linux): abre la app web incluida en dist/.
const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

// Una sola ventana: dos copias abiertas podrían pisarse al guardar.
if (!app.requestSingleInstanceLock()) app.quit()

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 500,
    title: 'Kuentu',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    backgroundColor: '#eef0f3',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  })
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  // Los enlaces (ej. créditos de ARASAAC) se abren en el navegador, no dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
