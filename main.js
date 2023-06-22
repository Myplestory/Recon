const { app, BrowserWindow } = require('electron')
const path = require('path')
const electronIpcMain = require('electron').ipcMain;
var fpath = require('path');
const { ValClient } = require("valclient.js");
var Proc = require('child_process').execFile;

// Global win var to prevent garbage collection
let win;

function createWindow() {
  // window creation
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    backgroundColor: '#FFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false
  })
  // opens index.html and gives it privilages
  win.loadFile('index.html')
  win.setBackgroundColor('#88b9dc')
  client = new ValClient()
  return win;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
//Window handlers
electronIpcMain.on('window:minimize', () => {
  win.minimize();
});
electronIpcMain.on('window:maximize', () => {
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
  win.restore();
});
electronIpcMain.on('window:close', () => {
  win.close();
});
electronIpcMain.on('window:maximize', () => {
  if (minmaxstate === false){
    win.maximize();
    minmaxstate = true;
  }
  else{
    win.unmaximize();
    minmaxstate = false;
  }
});

//Global var to allow termination of nodejs process whenever
var pyfile;


//Handler for scan start
electronIpcMain.on('data-from-renderer', (event, data) => {
  //Initialize args to start locking phase
  const jsonargs = data[0];
  const rdelay = data[1];
  const hdelay = data[2];
  const ldelay = data[3];
  //Getting correct path to script
  var f = fpath.join(__dirname, 'locker.exe')
  console.log("Process Path -> " + f)
  //Launch autolocking script with args
  pyfile = Proc(f,[jsonargs,rdelay,hdelay,ldelay], function(err, data) {  
    console.log(err)
    console.log(data.toString());                       
  }); 

})


// StopScan Handler
electronIpcMain.on('turn-off', (event) => {
  // Kill loop
  console.log("Killed child process!")
  pyfile.stdin.pause();
  pyfile.kill()
})