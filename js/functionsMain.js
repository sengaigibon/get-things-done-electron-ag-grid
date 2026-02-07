const {ipcRenderer} = require('electron');
const remote = require('@electron/remote');
const { dialog } = remote;
const $ = require('jquery');

// $(document).ready(function() {
//     debugger;

// });

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(function(){ 
        setToolBoxEvents();
        var gridDiv = document.querySelector('#gridTasks');
        agGrid.createGrid(gridDiv, window.gridOptions);
    }, 1000); 
})

function setToolBoxEvents() {
    $('#btnNewTask').on('click', function(e) {
        createTask();
    });

    $('#btnTaskDone').on('click', function(e) {
        completeTask();
    });

    $('#btnStartStop').on('click', function(e) {
        startStopTask();
    });

    $('#btnReports').on('click', function(e) {
        createReportsWindow();
    });
}

/**
 * @param {Object} schema
 */
function updateGrid(schema) {
    schema.getAllRows(function(err, rows) {
        if (err) {
          throw err;
        }

        var data = [];
        rows.forEach((row) => {
            data.push({id: row.taskId, tag: row.tag, title:row.title, startDate:row.startDate, status:row.status})
        });

        gridOptions.api.setGridOption('rowData', data);

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

    var schema = require('../js/schema');
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

    let schema = require('../js/schema');
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

    var schema = require('../js/schema');

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
    ipcRenderer.send('openReportsWindow');
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