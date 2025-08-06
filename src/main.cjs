const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

let win = null

function createWindow() {
  console.log('🚀 Creating Electron window...')
  
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Sometimes needed for proper CSS behavior in dev
    },
    autoHideMenuBar: true,  // Hides menu bar (can be toggled with Alt)
    show: false, // Don't show until ready to prevent flash
  })

  // Completely disable the application menu
  Menu.setApplicationMenu(null)

  // Force load from dev server
  const devUrl = 'http://localhost:3000'
  console.log('📡 Loading URL:', devUrl)
  
  win.loadURL(devUrl)
  win.webContents.openDevTools()

  // Debug events
  win.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading')
    win.show() // Show window after load to prevent flash
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('❌ Failed to load:', errorCode, errorDescription, validatedURL)
  })

  // Handle window closed
  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  console.log('🎯 Electron app is ready')
  createWindow()
})