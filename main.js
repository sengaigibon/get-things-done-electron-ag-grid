const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const remoteMain = require('@electron/remote/main');
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

  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools({mode: 'bottom'});
  mainWindow.focus();

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
 app.whenReady().then(initialize);

// // Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.on('activate', function () {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })

ipcMain.on('openReportsWindow', (event) => {
  // if (window.reportsWindow != null) {
  //       window.reportsWindow.focus();
  //       return;
  //   }

  const reportsWindow = new BrowserWindow({
      show: false,
      height: 800,
      width: 1200,
      webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false
      }
  });
  remoteMain.enable(reportsWindow.webContents);

  reportsWindow.loadFile('reports.html');
  // reportsWindow.webContents.openDevTools({mode: "left"});
  reportsWindow.once('ready-to-show', () => {
      reportsWindow.show(); 
  });
});

ipcMain.on('openTaskDetails', (event, taskId, startDate, stopDate) => {

  const detailsWindow = new BrowserWindow({
      show: false,
      height: 400,
      width: 640,
      webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false
      }
  });
  remoteMain.enable(detailsWindow.webContents);

  detailsWindow.loadFile('details.html');
  detailsWindow.webContents.openDevTools({mode: 'left'})
  detailsWindow.webContents.on('dom-ready', () => {
      detailsWindow.webContents.send('initializeTable', taskId, startDate, stopDate);
  });
  detailsWindow.once('ready-to-show', () => {
      detailsWindow.show(); 
  });
});