const remote = require('@electron/remote');
const { dialog } = remote;
const $ = require('jquery');

/**
 * Initialize component events 
 */
$(function() {
    debugger;

    setToolBoxEvents();
    var gridDiv = document.querySelector('#gridTasks');
    new agGrid.Grid(gridDiv, window.gridOptions);
});

function setToolBoxEvents() {
    $('#btnNewTask').click(function(e) {
        createTask();
    });

    $('#btnTaskDone').click(function(e) {
        completeTask();
    });

    $('#btnStartStop').click(function(e) {
        startStopTask();
    });

    $('#btnReports').click(function(e) {
        createReportsWindow();
    });
}

function updateGrid(schema) {
    schema.getAllRows(function(err, rows) {
        if (err) {
          throw err;
        }

        var data = [];
        rows.forEach((row) => {
            data.push({id: row.taskId, tag: row.tag, title:row.title, startDate:row.startDate, status:row.status})
        });

        gridOptions.api.setRowData(data);

        window.rowSelectedId = null;
        window.rowSelectedStatus = null;
    });
}

function createTask() {
    var taskTag = $('#inputTag').val();
    var taskName = $('#inputName').val();

    if (!taskName) {
        dialog.showMessageBox({
            buttons: ["OK"],
            type: "error",
            title: "Title can not be empty",
            message: "Title can not be empty! Type something to create a task."
        });
        return;
    }

    if (!taskTag) {
        taskTag = 'General';
    }

    var schema = require('./schema');
    schema.insertNew(taskTag, taskName, function(err) {
        if (err) {
            console.log(err.message);
            return false;
        }

        console.log(`A row has been inserted with rowid ${this.lastID}`);

        updateGrid(schema);
    });

    $('#inputTag').val('');
    $('#inputName').val('');
}

function completeTask() {
    if (!window.selectedRows) {
        dialog.showMessageBox({
            buttons: ["OK"],
            type: "error",
            title: "No task selected",
            message: "First select a task."
        });
        return;
    }

    let schema = require('./schema');
    selectedRows.forEach(function(row) {
        if (row.status == 'active') { //skip the task if it's active
            return; 
        }

        schema.updateStatus(row.id, schema.statusCompleted, function(err) {
            if (err) {
                console.log(err.message);
                return false;
            }
    
            console.log('Task ID ' + row.id + ' completed');
        });
    });
    updateGrid(schema);
}

function startStopTask() {

    if (!checkTask()) return;

    var schema = require('./schema');

    switch (window.rowSelectedStatus) {
        case 'idle':
            schema.startTracking(window.rowSelectedId, function(err) {
                if (err) {
                    console.log(err.message);
                    return false;
                }

                schema.updateStatus(window.rowSelectedId, schema.statusActive, function(err) {
                    if (err) {
                        console.log(err.message);
                        return false;
                    }

                    console.log('Task ID ' + window.rowSelectedId + ' started');
            
                    updateGrid(schema);
                });
            });

            break;

        case 'active':
            schema.stopTracking(window.rowSelectedId, function(err) {
                if (err) {
                    console.log(err.message);
                    return false;
                }

                schema.updateStatus(window.rowSelectedId, schema.statusIdle, function(err) {
                    if (err) {
                        console.log(err.message);
                        return false;
                    }

                    console.log('Task ID ' + window.rowSelectedId + ' is idle');
            
                    updateGrid(schema);
                });
            });            

            break;
    }

    if ($('#btnStartStopIcon').hasClass('fa-play-circle')) {
        $('#btnStartStopIcon').removeClass('fa-play-circle');
        $('#btnStartStopIcon').addClass('fa-stop-circle');
    } else if ($('#btnStartStopIcon').hasClass('fa-stop-circle')) {
        $('#btnStartStopIcon').removeClass('fa-stop-circle');
        $('#btnStartStopIcon').addClass('fa-play-circle');
    }
}

function createReportsWindow() {
    if (window.reportsWindow != null) {
        window.reportsWindow.focus();
        return;
    }

    const remote = require('@electron/remote');
    const BrowserWindow = remote.BrowserWindow;
    const reportsWindow = new BrowserWindow({
        show: false,
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    reportsWindow.loadFile('reports.html');
    reportsWindow.webContents.openDevTools({mode: "left"});
    reportsWindow.once('ready-to-show', () => {
        reportsWindow.show(); 
        window.reportsWindow = reportsWindow;
    });

    reportsWindow.once('close', () => {
        window.reportsWindow = null;
    });
  }

function checkTask() {
    if (!window.rowSelectedId) {
        dialog.showMessageBox({
            buttons: ["OK"],
            type: "error",
            title: "No task selected",
            message: "First select a task."
        });
        return false;
    }

    return true;
}