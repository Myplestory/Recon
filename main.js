const { app, BrowserWindow } = require('electron')
const path = require('path')
const electronIpcMain = require('electron').ipcMain;
var fpath = require('path');
const { ValClient } = require("valclient.js");
var Proc = require('child_process').execFile;
var fs = require('fs');

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

// Var to keep track of scanning state
// var boolswitch = false;

var pyfile;

// Read from json

//Handler for scan start
electronIpcMain.on('data-from-renderer', (event, data) => {
  //Initialize args to start locking phase
  // const seenMatches = []
  const jsonargs = data[0];
  const rdelay = data[1];
  const hdelay = data[2];
  const ldelay = data[3];
  // let agents;
  // let geomap;
  // var jdata = fpath.join(__dirname, 'data.json');
  // var jobj = fs.readFileSync(jdata,'utf8');
  // var obj = JSON.parse(jobj);
  // console.log(obj)
  // agents = obj["agents"];
  // geomap = obj["GeoServer"];
  // console.log(agents)
  // const Region = geomap[jsonargs["region"]];
  // console.log(Region)
  var f = fpath.join(__dirname, 'locker.exe')
  console.log("Process Path -> " + f)
  pyfile = Proc(f,[jsonargs,rdelay,hdelay,ldelay], function(err, data) {  
    console.log(err)
    console.log(data.toString());                       
  }); 
  // Locking loop
  // boolswitch = true;
  // while (boolswitch == true){
  //   sleep(100)
  //   lock(jsonargs,rdelay,hdelay,ldelay,seenMatches,Region)
  // }

})

// function lock(jsonargs,rdelay,hdelay,ldelay,seenMatches,Region){
//   const clientobj = new ValClient();
//     try{
//       // inizialite local endpoint connection
//       clientobj.init({ region: Region }).then(async () => {
//         let statesess = await clientobj.player.onlineFriend(clientobj.puuid)
//         await sleep(rdelay);
//         console.log(statesess)
//         let matchID = await clientobj.pre_game.current();
//         console.log(matchID)
//         if (statesess["sessionLoopState"] == "PREGAME" && !seenMatches.includes(matchID)){
//           seenMatches.push(matchID);
//           let matchInfo = await clientobj.pre_game.details(matchID);
//           mapName = matchInfo["MapID"].split('/')[-1].toLowerCase()
//           console.log(mapName);
//           if (jsonargs[mapName]){
//             pick = maps[mapName];
//             console.log(pick)
//             choice = agents[pick];
//             console.log(choice)
//             sleep(hdelay);
//             await clientobj.pre_game.selectCharacter(choice);
//             console.log("hovered...")
//             await sleep(ldelay);
//             clientobj.pre_game.lockCharacter(choice);
//             console.log("locked...")
//           }
//         }
//         })
//       }
//     // catches and processes err
//     catch(err){
//       console.log(err)
//     }
// }

// StopScan Handler
electronIpcMain.on('turn-off', (event) => {
  // Kill loop
  // boolswitch = false;
  console.log("Killed child process!")
  pyfile.stdin.pause();
  pyfile.kill()
})