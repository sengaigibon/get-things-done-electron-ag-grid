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
      {headerName: "Id", field: "id", checkboxSelection: true, width: 75, sortable: true},
      {headerName: "Tag", field: "tag", width: 80, resizable: true},
      {headerName: "Title", field: "title", width: 390, resizable: true},
      {headerName: "Start date", field: "startDate", width: 150},
      {headerName: "Status", field: "status", width: 70, sortable: true},
    ];

    var data = [];
    rows.forEach((row) => {
      data.push({id: row.taskId, tag: row.tag, title:row.title, startDate:row.startDate, status:row.status})
    });
    
    window.gridOptions = {
      columnDefs: columnDefs,
      rowData: data,
      rowHeight: 30,
      rowSelection: 'multiple',

      onGridReady: function(event) { console.log('The grid is now ready'); },
      onRowSelected: function (event) {
        var selection = window.gridOptions.api.getSelectedRows();
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
  // const replaceText = (selector, text) => {
  //   const element = document.getElementById(selector)
  //   if (element) element.innerText = text
  // }

  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }
  initializeTable();

})
