
function initializeTable()
{
    var schema = require('./schema');

    schema.getTasksByDate('today', null, null, function(err, rows) {
        if (err) {
        throw err;
        }

        var columnDefs = [
        {headerName: "Task", field: "title", width: 390, resizable: true},
        {headerName: "Total time", field: "total", width: 150},
        ];

        var data = [];
        var bigTotal = 0;
        rows.forEach((row) => {
            
            var total = row.total / 3600;
            bigTotal += total;
            data.push({title: row.title, total: total.toFixed(3)})
        });
        
        document.querySelector('#hours').innerText = bigTotal.toFixed(3);

        gridOptions = {
            columnDefs: columnDefs,
            rowData: data,
            resizable: true,
            rowHeight: 30,

            onGridReady: function(event) { console.log('The grid is now ready'); },
            onRowSelected: function (event) {
                    var selection = gridOptions.api.getSelectedRows();
                    window.rowSelectedId = selection.length ? selection[0].id : null; 
                    window.rowSelectedStatus = selection.length ? selection[0].status : null;

                    if (window.rowSelectedStatus == 'idle') {
                    $('#btnStartStopIcon').removeClass('fa-stop-circle');
                    $('#btnStartStopIcon').addClass('fa-play-circle');
                    } else if (window.rowSelectedStatus == 'active') {
                    $('#btnStartStopIcon').removeClass('fa-play-circle');
                    $('#btnStartStopIcon').addClass('fa-stop-circle');
                }
            }
        };

        var gridDiv = document.querySelector('#gridTasks');
        new agGrid.Grid(gridDiv, gridOptions);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initializeTable();
})