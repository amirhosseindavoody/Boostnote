// this script handles updating the application and installing the application in windows OS.

const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const ipc = electron.ipcMain
const path = require('path')
const ChildProcess = require('child_process')
const _ = require('lodash')
// const GhReleases = require('electron-gh-releases') // handles updating the application to newer released versions
// electron.crashReporter.start()
var ipcServer = null

var mainWindow = null

// make sure only a single instance of the application is running
// This Electron method makes your application a Single Instance Application - instead of allowing multiple instances of your app to run, this will ensure that only a single instance of your app is running, and other instances signal this instance and exit.
var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
  if (mainWindow) {
    if (process.platform === 'win32') {
      mainWindow.minimize()
      mainWindow.restore()
    }
    mainWindow.focus()
  }
  return true
})

if (shouldQuit) {
  app.quit()
}

// // // this section checks for a new released version of the application
// var isUpdateReady = false
//
// var ghReleasesOpts = {
//   repo: 'BoostIO/boost-releases',
//   currentVersion: app.getVersion()
// }
//
// const updater = new GhReleases(ghReleasesOpts)
//
// // Check for updates
// // `status` returns true if there is a new update available
// function checkUpdate () {
//   if (process.platform === 'linux' || isUpdateReady) {
//     return true
//   }
//   updater.check((err, status) => {
//     if (err) {
//       var isLatest = err.message === 'There is no newer version.'
//       if (!isLatest) console.error('Updater error! %s', err.message)
//       return
//     }
//     if (status) {
//       mainWindow.webContents.send('update-found', 'Update available!')
//       updater.download()
//     }
//   })
// }
//
// updater.on('update-downloaded', (info) => {
//   if (mainWindow != null) {
//     mainWindow.webContents.send('update-ready', 'Update available!')
//     isUpdateReady = true
//   }
// })
//
// updater.autoUpdater.on('error', (err) => {
//   console.log(err)
// })
//
// ipc.on('update-check', function (event, msg) {
//   if (isUpdateReady) {
//     mainWindow.webContents.send('update-ready', 'Update available!')
//   } else {
//     checkUpdate()
//   }
// })
//
// ipc.on('update-app-confirm', function (event, msg) {
//   if (isUpdateReady) {
//     mainWindow.removeAllListeners()
//     updater.install()
//   }
// })

function spawnFinder () {
  var finderArgv = [path.join(__dirname, 'finder-app.js'), '--finder']
  if (_.find(process.argv, a => a === '--hot')) finderArgv.push('--hot')
  var finderProcess = ChildProcess
    .execFile(process.execPath, finderArgv)

  app.on('before-quit', function () {
    finderProcess.kill()
  })
}

app.on('ready', function () {
  // create the mainWindow object, load the main.html file in the mainWindow, and return the mainWindow object
  mainWindow = require('./main-window')

  // // set the application menu at the top of the screen or application header for each platform
  // var template = require('./main-menu')
  // var menu = Menu.buildFromTemplate(template)
  // switch (process.platform) {
  //   case 'darwin':
  //     spawnFinder()
  //     Menu.setApplicationMenu(menu)
  //     break
  //   case 'win32':
  //     /* eslint-disable */
  //     finderWindow = require('./finder-window')
  //     /* eslint-disable */
  //     mainWindow.setMenu(menu)
  //     break
  //   case 'linux':
  //     Menu.setApplicationMenu(menu)
  //     mainWindow.setMenu(menu)
  // }

  // // Check update every hour
  // setInterval(function () {
  //   checkUpdate()
  // }, 1000 * 60 * 60)

  // checkUpdate()

  // setup an ipc server to communicate between different processes in the application. ipcServer is an instance of node-ipc
  ipcServer = require('./ipcServer')
  ipcServer.server.start()
})

module.exports = app
