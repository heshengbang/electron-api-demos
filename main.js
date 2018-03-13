const path = require('path')
const glob = require('glob')
const setting = require('electron-settings')
const {app, BrowserWindow} = require('electron')
const autoUpdater = require('./auto-updater')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Electron APIs')

let mainWindow = null

function initialize () {
  const shouldQuit = makeSingleInstance()
    // 如果根据用户版本获取的结果是该退出而不是启动，则应用退出
  if (shouldQuit) return app.quit()

  loadDemos()
    // 创建窗口
  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
        // 此处会设置窗口右上角显示的标题
      title: app.getName()
    }
    // linux上显示大一点的图标
    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }
    // 创建主窗口实例
    mainWindow = new BrowserWindow(windowOptions)
      // 加载index.html
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
      // 将开发者工具打开
    mainWindow.webContents.openDevTools()
    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.maximize()
      require('devtron').install()
    }
    // 定义主窗口关闭事件
    mainWindow.on('closed', () => {
      setting.delete('activeDemoButtonId')
      mainWindow = null
    })
  }
  // 应用准备事件
  app.on('ready', () => {
    createWindow()
    autoUpdater.initialize()
  })

  app.on('window-all-closed', () => {
    setting.delete('activeDemoButtonId')
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

// 使这个应用变成单例应用.
//
// 当用户试图开启第二个实例的时候，主窗口将会恢复并聚焦，而不是打开第二个窗口实例
// 如果当前应用的版本应该退出而不是启动的话，就会返回true
function makeSingleInstance () {
  if (process.mas) return false

  return app.makeSingleInstance(() => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// 加载main-process目录下的所有JS文件
function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
  autoUpdater.updateMenu()
}

// 处理应用启动时的各种参数
switch (process.argv[1]) {
  case '--squirrel-install':
    autoUpdater.createShortcut(() => { app.quit() })
    break
  case '--squirrel-uninstall':
    autoUpdater.removeShortcut(() => { app.quit() })
    break
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit()
    break
  default:
    initialize()
}
