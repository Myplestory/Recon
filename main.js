const { app, BrowserWindow } = require('electron')
const path = require('path')
const electronIpcMain = require('electron').ipcMain;

let win;


function createWindow() {
  // window creation
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    backgroundColor: '#FFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
    frame: false
  })
  win.loadFile('index.html')
  win.setBackgroundColor('#88b9dc')
  return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// WINDOW CONTROLS

let minmaxstate = false;

electronIpcMain.on('window:minimize', () => {
  // Now we can access the window variable
  win.minimize();
});

electronIpcMain.on('window:maximize', () => {
  // Now we can access the window variable
  if (minmaxstate === false){
    win.maximize();
    minmaxstate = true;
  }
  else{
    win.unmaximize();
    minmaxstate = false;
  }
});

electronIpcMain.on('window:restore', () => {
  // Now we can access the window variable
  win.restore();
});

electronIpcMain.on('window:close', () => {
  // Now we can access the window variable
  win.close();
});

// 