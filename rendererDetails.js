const { dialog } = require('electron').remote
const ipc = require('electron').ipcRenderer;
const $ = require('jQuery');
const _DATE_FORMAT = require('dateformat');

$(document).ready(function(){
    //setLocalEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    //
})

ipc.on('message', (event, data) => {
    console.log("received: " + data);
    taskId = data; 
    initializeTable(taskId);
})

function initializeTable(taskId) {
    var schema = require('./schema');
    var today = new Date();

    schema.getTracksByTask(taskId, _DATE_FORMAT(today, 'yyyy-mm-dd'), _DATE_FORMAT(today.setDate(today.getDate() + 1), 'yyyy-mm-dd'), function(err, rows) {
        if (err) {
            throw err;
        }

        var columnDefs = [
            {headerName: "Task", field: "title", width: 250, resizable: true},
            {headerName: "Began", field: "start", width: 140, resizable: true},
            {headerName: "Ended", field: "stop", width: 140, resizable: true},
            {headerName: "Duration", field: "total", width: 80},
        ];

        var data = setGridData(rows);

        gridOptions = {
            columnDefs: columnDefs,
            rowData: data,
            resizable: true,
            rowHeight: 30,

            onGridReady: function(event) { console.log('The grid is now ready'); },
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
        data.push({id: row.id, title: row.title, start: row.start, stop: row.stop, total: total.toFixed(3)})
    });
    
    return data;
}