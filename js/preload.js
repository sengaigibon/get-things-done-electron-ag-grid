window.gridOptions;
window.rowSelectedId = null;
window.rowSelectedStatus = null;
window.selectedRows = null;

function initializeTable()
{
  var schema = require('./schema');

  schema.getAllRows(function(err, rows) {
    if (err) {
      throw err;
    }

    var columnDefs = [
      {headerName: "Id", field: "id", width: 65, sortable: true, resizable: false},
      {headerName: "Tag", field: "tag", width: 80, resizable: false},
      {headerName: "Title", field: "title", width: 330, resizable: false},
      {headerName: "Start date", field: "startDate", width: 165, resizable: false},
      {headerName: "Status", field: "status", width: 75, sortable: true, resizable: false},
    ];

    var data = [];
    rows.forEach((row) => {
      data.push({id: row.taskId, tag: row.tag, title:row.title, startDate:row.startDate, status:row.status})
    });
    
    window.gridOptions = {
      theme: agGrid.themeQuartz,
      columnDefs: columnDefs,
      rowData: data,
      rowHeight: 30,
      headerHeight: 30,
      rowSelection: { 
        mode: 'multiRow',
        checkboxes: true,
        enableClickSelection: true
      },

      onGridReady: function(event) { console.log('Grid ready, data loaded.'); },
      onSelectionChanged: function (event) {
        var selection = event.api.getSelectedRows();
        window.selectedRows = selection.length ? selection : null;
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
  });
};

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  initializeTable();
})
