// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { dialog } = require('electron').remote
const $ = require('jQuery');

/**
 * Initialize component events
 */
$(document).ready(function(){
    setToolBoxEvents();
});

function setToolBoxEvents()
{
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
        reporting();
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
    if (!window.rowSelectedId) {
        dialog.showMessageBox({
            buttons: ["OK"],
            type: "error",
            title: "No task selected",
            message: "First select a task."
        });
        return;
    }
    //todo: check if task is running

    var schema = require('./schema');
    schema.updateStatus(window.rowSelectedId, schema.statusCompleted, function(err) {
        if (err) {
            console.log(err.message);
            return false;
        }

        console.log('Task ID ' + window.rowSelectedId + ' completed');

        updateGrid(schema);
    });

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

function afterDbActivity(err) {

}
