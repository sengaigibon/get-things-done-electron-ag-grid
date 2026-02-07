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

    schema.getTasksByDate(lastStartDate, lastStopDate, function(err, rows) {
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
            rowHeight: 30,

            onRowDoubleClicked: function(event) {
                ipcRenderer.send('openTaskDetails', event.data.id, lastStartDate, lastStopDate);
            }
        };

        var gridDiv = document.querySelector('#gridTasks');
        new agGrid.Grid(gridDiv, gridOptions);
    });
}

function setLocalEvents() {
    $('#btnSearchPreset').on('click', function(e) {
        searchPreset()
    });

    $('#btnSearchCustom').on('click', function(e) {
        searchByDates()
    });

}

function searchPreset() {
    var preset = $('#presets :selected').val();
    var startDate = null;
    var stopDate = null;

    switch (preset) {
        case 'today':
            startDate = DATE_FORMAT(new Date(), 'yyyy-mm-dd');
            stopDate = new Date();
            stopDate.setDate(stopDate.getDate() + 1);
            stopDate = DATE_FORMAT(stopDate, 'yyyy-mm-dd');
            break;

        case 'yesterday':
            stopDate = DATE_FORMAT(new Date(), 'yyyy-mm-dd');
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate = DATE_FORMAT(startDate, 'yyyy-mm-dd');
            break;

        case 'thisWeek':
            var today = new Date();
            var dayOfWeek = today.getDay();
            var monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startDate = DATE_FORMAT(monday, 'yyyy-mm-dd');
            var nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);
            stopDate = DATE_FORMAT(nextMonday, 'yyyy-mm-dd');
            break;

        case 'lastWeek':
            var today = new Date();
            var dayOfWeek = today.getDay();
            var thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            var lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);
            startDate = DATE_FORMAT(lastMonday, 'yyyy-mm-dd');
            stopDate = DATE_FORMAT(thisMonday, 'yyyy-mm-dd');
            break;

        case 'thisMonth':
            var today = new Date();
            var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = DATE_FORMAT(firstDay, 'yyyy-mm-dd');
            var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            stopDate = DATE_FORMAT(nextMonth, 'yyyy-mm-dd');
            break;

        case 'lastMonth':
            var today = new Date();
            var firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            startDate = DATE_FORMAT(firstDayLastMonth, 'yyyy-mm-dd');
            var firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            stopDate = DATE_FORMAT(firstDayThisMonth, 'yyyy-mm-dd');
            break;

        default:
            startDate = lastStartDate;
            stopDate = lastStopDate;
    }

    updateGrid(startDate, stopDate);
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

    updateGrid(DATE_FORMAT(startDate, 'yyyy-mm-dd'), DATE_FORMAT(stopDate, 'yyyy-mm-dd'));
}

/**
 * @param {string} startDate 
 * @param {string} stopDate 
 */
function updateGrid(startDate, stopDate) {
    lastStartDate = startDate;
    lastStopDate = stopDate;
    var schema = require('../js/schema'); 
    schema.getTasksByDate(startDate, stopDate, function(err, rows) {
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

