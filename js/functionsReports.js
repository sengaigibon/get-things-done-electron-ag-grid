const {ipcRenderer} = require('electron');
const remote = require('@electron/remote');
const { dialog } = remote;
const $ = require('jquery');
var lastStartDate, lastStopDate;
var gridApi;

$(function() {
    setLocalEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    //set default dates
    lastStartDate = formatDate(new Date());
    lastStopDate = new Date();
    lastStopDate.setDate(lastStopDate.getDate() + 1);
    lastStopDate = formatDate(lastStopDate);

    initializeTable();
})

function initializeTable() {
    var schema = require('../js/schema');

    schema.getTasksByDate(lastStartDate, lastStopDate, function(err, rows) {
        if (err) {
        throw err;
        }

        var columnDefs = [
            {headerName: "Id", field: "id", width: 75, sortable: true, resizable: false},
            {headerName: "Task", field: "title", width: 390, resizable: false},
            {headerName: "Total time", field: "total", width: 150, resizable: false},
            {headerName: "Status", field: "status", width: 75, resizable: false},
        ];

        var data = setGridData(rows);

        gridOptions = {
            theme: agGrid.themeQuartz,
            columnDefs: columnDefs,
            rowData: data,
            rowHeight: 30,
            headerHeight: 30,
            onRowDoubleClicked: function(event) {
                ipcRenderer.send('openTaskDetails', event.data.id, lastStartDate, lastStopDate);
            }
        };

        var gridDiv = document.querySelector('#gridTasks');
        gridApi = agGrid.createGrid(gridDiv, gridOptions);
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
            startDate = formatDate(new Date());
            stopDate = new Date();
            stopDate.setDate(stopDate.getDate() + 1);
            stopDate = formatDate(stopDate);
            break;

        case 'yesterday':
            stopDate = formatDate(new Date());
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            startDate = formatDate(startDate);
            break;

        case 'thisWeek':
            var today = new Date();
            var dayOfWeek = today.getDay();
            var monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startDate = formatDate(monday);
            var nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);
            stopDate = formatDate(nextMonday);
            break;

        case 'lastWeek':
            var today = new Date();
            var dayOfWeek = today.getDay();
            var thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            var lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);
            startDate = formatDate(lastMonday);
            stopDate = formatDate(thisMonday);
            break;

        case 'thisMonth':
            var today = new Date();
            var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = formatDate(firstDay);
            var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            stopDate = formatDate(nextMonth);
            break;

        case 'lastMonth':
            var today = new Date();
            var firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            startDate = formatDate(firstDayLastMonth);
            var firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            stopDate = formatDate(firstDayThisMonth);
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

    updateGrid(formatDate(startDate), formatDate(stopDate));
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
        gridApi.setGridOption('rowData', data);
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

