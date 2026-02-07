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
      preload: path.join(__dirname, '/js/', 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false 
    }
  });
    remoteMain.enable(mainWindow.webContents);

  mainWindow.loadFile('./pages/index.html')
  // mainWindow.webContents.openDevTools({mode: 'detach'});
  mainWindow.focus();
} 

function initialize () 
{
    var dbSchema = require('./js/schema');
    dbSchema.initDb();
    createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
 app.whenReady().then(initialize);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.on('openReportsWindow', (event) => {

  const reportsWindow = new BrowserWindow({
      show: false,
      height: 610,
      width: 800,
      resizable: false,
      webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false
      }
  });
  remoteMain.enable(reportsWindow.webContents);

  reportsWindow.loadFile('./pages/reports.html');
  // reportsWindow.webContents.openDevTools({mode: 'detach'});
  reportsWindow.once('ready-to-show', () => {
    reportsWindow.show(); 
  });
});

ipcMain.on('openTaskDetails', (event, taskId, startDate, stopDate) => {

  const detailsWindow = new BrowserWindow({
      show: false,
      height: 400,
      width: 640,
      resizable: false,
      webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false
      }
  });
  remoteMain.enable(detailsWindow.webContents);

  detailsWindow.loadFile('./pages/details.html');
  // detailsWindow.webContents.openDevTools({mode: 'detach'});
  detailsWindow.webContents.on('dom-ready', () => {
      detailsWindow.webContents.send('initializeTable', taskId, startDate, stopDate);
  });
  detailsWindow.once('ready-to-show', () => {
      detailsWindow.show(); 
  });
});