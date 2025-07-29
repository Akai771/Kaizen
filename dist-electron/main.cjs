const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

let win = null

function createWindow() {
  console.log('🚀 Creating Electron window...')
  
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Remove the menu bar completely
    autoHideMenuBar: true,  // Hides menu bar (can be toggled with Alt)
    // OR use this to completely remove it:
    // frame: false,  // Removes title bar and menu entirely (more drastic)
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