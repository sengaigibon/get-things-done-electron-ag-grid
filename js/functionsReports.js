const {ipcRenderer} = require('electron');
const remote = require('@electron/remote');
const { dialog } = remote;
const $ = require('jquery');
const DATE_FORMAT = require('dateformat');
var lastStartDate, lastStopDate;

$(function() {
    setLocalEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    //set default dates
    lastStartDate = DATE_FORMAT(new Date(), 'yyyy-mm-dd');
    lastStopDate = new Date();
    lastStopDate.setDate(lastStopDate.getDate() + 1);
    lastStopDate = DATE_FORMAT(lastStopDate, 'yyyy-mm-dd');

    initializeTable();
})

function initializeTable() {
    var schema = require('../js/schema');

    schema.getTasksByDate('today', null, null, function(err, rows) {
        if (err) {
        throw err;
        }

        var columnDefs = [
            {headerName: "Id", field: "id", checkboxSelection: true, width: 75, sortable: true},
            {headerName: "Task", field: "title", width: 390, resizable: true},
            {headerName: "Total time", field: "total", width: 150},
            {headerName: "Status", field: "status", width: 150},
        ];

        var data = setGridData(rows);

        gridOptions = {
            columnDefs: columnDefs,
            rowData: data,
            resizable: true,
            rowHeight: 30,

            onGridReady: function(event) { console.log('The grid is now ready'); },
            onRowDoubleClicked: function(event) {
                ipcRenderer.send('openTaskDetails', event.data.id, lastStartDate, lastStopDate);
            }
        };

        var gridDiv = document.querySelector('#gridTasks');
        new agGrid.Grid(gridDiv, gridOptions);
    });
}

function setLocalEvents() {
    $('#btnSearchPreset').click(function(e) {
        searchPreset()
    });

    $('#btnSearchCustom').click(function(e) {
        searchByDates()
    });

}

function searchPreset() {
    var preset = $('#presets :selected').val();
    var startDate = null;
    var stopDate = null;

    switch (preset) {
        case 'yesterday':
            var stopDate = DATE_FORMAT(new Date(), 'yyyy-mm-dd');
            var startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate = DATE_FORMAT(startDate, 'yyyy-mm-dd');
            break;
    }

    updateGrid(preset, startDate, stopDate);
}

function searchByDates() {
    var startDate = $('#startDate').val();
    var stopDate = $('#stopDate').val();

    if (!startDate || !stopDate) {
        dialog.showMessageBox({
            buttons: ["OK"],
            type: "error",
            title: "No dates selected",
            message: "First start and stop dates."
        });
        return;
    }

    updateGrid('custom', DATE_FORMAT(startDate, 'yyyy-mm-dd'), DATE_FORMAT(stopDate, 'yyyy-mm-dd'));
}

/**
 * @param {string} preset 
 * @param {string} startDate 
 * @param {string} stopDate 
 */
function updateGrid(preset, startDate, stopDate) {
    lastStartDate = startDate;
    lastStopDate = stopDate;
    var schema = require('../js/schema'); 
    schema.getTasksByDate(preset, startDate, stopDate, function(err, rows) {
        if (err) {
            throw err;
        }
        var data = setGridData(rows);
        gridOptions.api.setRowData(data);
    })
}

/**
 * @param {_SQLITE3.row[]} rows 
 */
function setGridData(rows) {
    var data = [];
    var bigTotal = 0;
    rows.forEach((row) => {
        var total = row.total / 3600;
        bigTotal += total;
        data.push({id: row.id, title: row.title, total: total.toFixed(3), status: row.status})
    });
    
    document.querySelector('#hours').innerText = bigTotal.toFixed(3);

    return data;
}

