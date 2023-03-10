const { dialog } = require('electron').remote
const ipc = require('electron').ipcRenderer;
const $ = require('jQuery');
const DATE_FORMAT = require('dateformat');

$(document).ready(function(){
    //setLocalEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    //
})

ipc.on('message', (event, data) => {
    initializeTable(data.id, data.startDate, data.stopDate);
})

function initializeTable(taskId, startDate, stopDate) {
    var schema = require('./schema');

    schema.getTracksByTask(taskId, startDate, stopDate, function(err, rows) {
        if (err) {
            throw err;
        }

        var columnDefs = [
            {headerName: "Task", field: "title", width: 250, resizable: true},
            {headerName: "Began", field: "start", width: 140, resizable: true, editable: true},
            {headerName: "Ended", field: "stop", width: 140, resizable: true, editable: true},
            {headerName: "Duration", field: "total", width: 80, editable: false},
        ];

        var data = setGridData(rows);

        gridOptions = {
            columnDefs: columnDefs,
            rowData: data,
            resizable: true,
            rowHeight: 30,

            onGridReady: function(event) { 
                //
            },
            onCellValueChanged: function(event) {
                var schema = require('./schema');
                schema.updateTrackData(event.data.trackId, event.data.start, event.data.stop, function(err) {
                    if (err) {
                        console.log(err.message);
                        return false;
                    }
                    
                    updateGrid(event.data.taskId, startDate, stopDate);
                });
            }
        };

        var gridDiv = document.querySelector('#gridTasks');
        new agGrid.Grid(gridDiv, gridOptions);
    });
}

/**
 * @param {_SQLITE3.row[]} rows 
 */
function setGridData(rows) {
    var data = [];
    var total;
    rows.forEach((row) => {
        total = row.total / 3600;
        data.push({
            trackId: row.trackId, 
            taskId: row.taskId, 
            title: row.title, 
            start: row.start, 
            stop: row.stop, 
            total: total.toFixed(3)
        })
    });
    
    return data;
}

/**
 * @param {string} taskId 
 * @param {string} startDate 
 * @param {string} stopDate 
 */
function updateGrid(taskId, startDate, stopDate) {
    var schema = require('./schema'); 
    schema.getTracksByTask(taskId, startDate, stopDate, function(err, rows) {
        if (err) {
            throw err;
        }
        var data = setGridData(rows);
        gridOptions.api.setRowData(data);
    });
}