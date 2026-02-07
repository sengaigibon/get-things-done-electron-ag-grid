const ipc = require('electron').ipcRenderer;

ipc.on('initializeTable', (event, taskId, startDate, stopDate) => {
    initializeTable(taskId, startDate, stopDate);
})

/**
 * @param {number} taskId
 * @param {string} startDate
 * @param {string} stopDate
 */
function initializeTable(taskId, startDate, stopDate) {
    var schema = require('../js/schema');

    schema.getTracksByTask(taskId, startDate, stopDate, function(err, rows) {
        if (err) {
            throw err;
        }

        var columnDefs = [
            {headerName: "Task", field: "title", width: 250, resizable: false},
            {headerName: "Began", field: "start", width: 165, resizable: false, editable: true},
            {headerName: "Ended", field: "stop", width: 165, resizable: false, editable: true},
            {headerName: "Duration", field: "total", width: 90, editable: false, resizable: false},
        ];

        var data = setGridData(rows);
        
        gridOptions = {
            theme: agGrid.themeQuartz,
            columnDefs: columnDefs,
            rowData: data,
            rowHeight: 30,
            defaultColDef: {
                resizable: false
            },
            onCellValueChanged: function(event) {
                var schema = require('../js/schema');
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
        agGrid.createGrid(gridDiv, gridOptions);
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
    var schema = require('../js/schema'); 
    schema.getTracksByTask(taskId, startDate, stopDate, function(err, rows) {
        if (err) {
            throw err;
        }
        var data = setGridData(rows);
        gridOptions.api.setGridOption('rowData', data);
    });
}