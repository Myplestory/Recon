const { app, BrowserWindow } = require('electron')
const path = require('path')
const electronIpcMain = require('electron').ipcMain;
const {PythonShell} = require('python-shell');

let win;


function createWindow() {
  // window creation
  win = new BrowserWindow({
    width: 990,
    height: 576,
    autoHideMenuBar: true,
    backgroundColor: '#FFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
    frame: false
  })
  // opens index.html and gives it privilages
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

//Run Locker script with posted json values
electronIpcMain.on('Run-Locker-action', (event,arg) => {
  function RunLocker(arg){
    PythonShell.run("locker.py",null,function(err,results){
        console.log(results)
        console.log("Locker ran!")
    });
  };
  // return some data to renderer process with mainprocess response id
  event.sender.send('Run-Locker-response');
});


// 