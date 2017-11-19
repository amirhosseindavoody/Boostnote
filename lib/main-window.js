// this script defines opening and closing the mainWindow of the application.
// it loads the main html file: main.html

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const Config = require('electron-config')
const config = new Config()

var showMenu = process.platform !== 'win32'
const windowSize = config.get('windowsize') || { width: 1080, height: 720 }


// make the main window of the program
const mainWindow = new BrowserWindow({
  width: windowSize.width,
  height: windowSize.height,
  minWidth: 500,
  minHeight: 320,
  autoHideMenuBar: showMenu,
  webPreferences: {
    zoomFactor: 1.0,
    blinkFeatures: 'OverlayScrollbars'
  },
  icon: path.resolve(__dirname, '../resources/app.png'),
})

// load the main.html file
const url = path.resolve(__dirname, './main.html')
mainWindow.loadURL('file://' + url)

// prevent window from opening a new BrowserWindow when a link is clicked or a new
mainWindow.webContents.on('new-window', function (e) {
  e.preventDefault()
})

// send keyDown event to the webpage
mainWindow.webContents.sendInputEvent({
  type: 'keyDown',
  keyCode: '\u0008'
})

// send keyDown event to the webpage
mainWindow.webContents.sendInputEvent({
  type: 'keyUp',
  keyCode: '\u0008'
})

if (process.platform !== 'linux' || process.env.DESKTOP_SESSION === 'cinnamon') {

  // define the behavior when closing the application window
  mainWindow.on('close', function (e) {
    e.preventDefault()
    if (process.platform === 'win32') {
      quitApp()
    } else {
      if (mainWindow.isFullScreen()) {
        mainWindow.once('leave-full-screen', function () {
          mainWindow.hide()
        })
        mainWindow.setFullScreen(false)
      } else {
        mainWindow.hide()
      }
    }
  })

  // define the behavior when quiting the application
  app.on('before-quit', function (e) {
    storeWindowSize()
    mainWindow.removeAllListeners()
  })
} else {
  app.on('window-all-closed', function () {
    quitApp()
  })
}

function quitApp () {
  storeWindowSize()
  app.quit()
}

// store the window size for the next time the application is opened
function storeWindowSize () {
  try {
    config.set('windowsize', mainWindow.getBounds())
  } catch (e) {
    // ignore any errors because an error occurs only on update
    // refs: https://github.com/BoostIO/Boostnote/issues/243
  }
}

app.on('activate', function () {
  if (mainWindow == null) return null
  mainWindow.show()
})

module.exports = mainWindow
