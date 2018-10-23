const {app, BrowserWindow} = require('electron')

let mainWindow

function createWindow () {
  var fullscreen = false;

  if (process.env.NODE_ENV !== 'development') {
    fullscreen = true;
  }

  mainWindow = new BrowserWindow({
    frame: false,
    width: 800,
    height: 480,
    fullscreen: fullscreen
  });

  mainWindow.loadFile('index.html');

  mainWindow.setPosition(0, 0);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})