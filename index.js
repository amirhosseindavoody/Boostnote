const { app } = require('electron')
const ChildProcess = require('child_process')
const path = require('path')

var error = null

// check if --finder argument is passed to the program
function isFinderCalled () {
  var argv = process.argv.slice(1)
  return argv.some((arg) => arg.match(/--finder/))
}

function execMainApp () {
  const appRootPath = path.join(process.execPath, '../..')
  const updateDotExePath = path.join(appRootPath, 'Update.exe')
  const exeName = path.basename(process.execPath)

  // this is related to the Squirrel package related to update and installing in windows platform
  function spawnUpdate (args, cb) {
    var stdout = ''
    var updateProcess = null
    try {
      updateProcess = ChildProcess.spawn(updateDotExePath, args)
    } catch (e) {
      process.nextTick(function () {
        cb(e)
      })
    }

    updateProcess.stdout.on('data', function (data) {
      stdout += data
    })

    updateProcess.on('error', function (_error) {
      error = _error
    })
    updateProcess.on('close', function (code, signal) {
      if (code !== 0) {
        error = new Error('Command failed: #{signal ? code}')
        error.code = code
        error.stdout = stdout
      }

      cb(error, stdout)
    })
  }

  // handle Squirrel package for windows platform
  // Squirrel is both a set of tools and a library, to completely manage both installation and updating your Desktop Windows application
  // look here for more: https://github.com/Squirrel/Squirrel.Windows/blob/master/docs/goals.md
  var handleStartupEvent = function () {
    if (process.platform !== 'win32') {
      return false
    }

    var squirrelCommand = process.argv[1]
    switch (squirrelCommand) {
      case '--squirrel-install':
        spawnUpdate(['--createShortcut', exeName], function (err) {
          if (err) console.error(err)
          app.quit()
        })
        return true
      case '--squirrel-updated':
        app.quit()
        return true
      case '--squirrel-uninstall':
        spawnUpdate(['--removeShortcut', exeName], function (err) {
          if (err) console.error(err)
          app.quit()
        })
        return true
      case '--squirrel-obsolete':
        app.quit()
        return true
    }
  }

  if (handleStartupEvent()) {
    return
  }

  // run the main-app script
  require('./lib/main-app')
}

///////////////////////////////////
// this is the start of the program
///////////////////////////////////
if (isFinderCalled()) {
  require('./lib/finder-app') // if the --finder argument is passed to the program, execute the finder-app.js
} else {
  execMainApp()
}
