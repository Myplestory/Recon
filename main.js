const { app, BrowserWindow } = require('electron')
const path = require('path')
const electronIpcMain = require('electron').ipcMain;
var fpath = require('path');
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
  win.loadFile('index.html');
  win.setBackgroundColor('#88b9dc');
  return win;
}

// Global var to prevent garbage collection
// We are using the execFile method due to the single threading nature of JavaScript. By compiling our Python script into an exe first, and then running it as a process, we ensure that the script runs flawlessly while the chromium window remains in use.
var pyfile;

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
    try{
      pyfile.stdin.pause();
      Proc("taskkill", ["/pid", pyfile.pid, '/f', '/t']);
      console.log("Killed child process!")
    }
    catch{
      console.log("No processes to be culled!")
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

// electronIpcMain.handle('clientstatus', async (event, data) => {
//   const region = data
//   console.log(region)
// })

//Handler for scan start
electronIpcMain.on('data-from-renderer', (event, data) => {
  //Initialize args to start locking phase
  const jsonargs = data[0];
  const rdelay = data[1];
  const hdelay = data[2];
  const ldelay = data[3];
  //Getting correct path to script executable
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
  try{
    pyfile.stdin.pause();
    Proc("taskkill", ["/pid", pyfile.pid, '/f', '/t']);
    console.log("Killed child process!")
  }
  catch{
    console.log("No processes to be culled!")
  }
})