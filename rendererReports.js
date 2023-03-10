const { dialog } = require('electron').remote
const $ = require('jQuery');
const DATE_FORMAT = require('dateformat');

$(document).ready(function(){
    setLocalEvents();
});

window.addEventListener('DOMContentLoaded', () => {
    initializeTable();
})

function initializeTable() {
    var schema = require('./schema');

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
                const remote = require('electron').remote;
                const BrowserWindow = remote.BrowserWindow;
                const detailsWindow = new BrowserWindow({
                    show: false,
                    height: 400,
                    width: 640,
                    webPreferences: {
                        nodeIntegration: true
                    }
                });
                
                detailsWindow.loadFile('details.html');
                detailsWindow.webContents.openDevTools({mode: 'detach'})
                detailsWindow.webContents.on('dom-ready', () => {
                    detailsWindow.webContents.send('message', event.data);
                });
                detailsWindow.once('ready-to-show', () => {
                    detailsWindow.show(); 
                    // window.reportsWindow = reportsWindow;
                });
                
                detailsWindow.once('close', () => {
                    // window.reportsWindow = null;
                });
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
    var schema = require('./schema'); 
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

