// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const remoteMain = require('@electron/remote/main')
remoteMain.initialize()

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false 
    }
  });
    remoteMain.enable(mainWindow.webContents);

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools({mode: 'bottom'});

  mainWindow.focus();
  window.mainWindow = mainWindow;

  // app.on('browser-window-created', (_, window) => {
  //   debugger;
  //   require("@electron/remote/main").enable(window.webContents)
  // });
} 

function initialize () 
{
    var dbSchema = require('./schema');
    dbSchema.initDb();
    createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
 app.whenReady().then(initialize)

// // Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// app.on('activate', function () {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })
