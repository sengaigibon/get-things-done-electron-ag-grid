window.gridOptions;
window.rowSelected = null;

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
  
    gridOptions = {
      columnDefs: columnDefs,
      rowData: data,
      resizable: true,
      rowHeight: 30,

      onGridReady: function(event) { console.log('The grid is now ready'); },
      onRowSelected: function (event) { 
        var selection = gridOptions.api.getSelectedRows();
        window.rowSelected = selection.length ? selection[0].id : null; 
      }
    };
  
    var gridDiv = document.querySelector('#gridTasks');
    new agGrid.Grid(gridDiv, gridOptions);
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