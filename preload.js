var sqlite3;
var db;
var rowData = [];

const DB_DIR = 'db'
const DB_NAME = 'get_things_done.sqlite'
const DB_PATH = DB_DIR + '/' + DB_NAME;

sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database(DB_PATH);


function setToolBoxEvents()
{
    $('#btnNewTask').click(function(e) {
        createTask();
    });

    $('#btnTaskDone').click(function(e) {
        completeTask();
    });

    $('#btnStartStop').click(function(e) {
        startStopTask();
    });

    $('#btnReports').click(function(e) {
        reporting();
    });
}

function fillTable()
{
  let sql = "select * from tasks where status != 'completed' order by taskId desc";

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach((row) => {
      rowData.push({id: row.taskId, tag: row.tag, title:row.title, startDate:row.startDate, status:row.status})
    });

    // $('#tasksTableBody').html(htmlRows);

    // reestablishEventsOnTableElements();
  });
};
fillTable();

var columnDefs = [
  {headerName: "Id", field: "id", checkboxSelection: true, width: 75 },
  {headerName: "Tag", field: "tag", width: 80},
  {headerName: "Title", field: "title", width: 390},
  {headerName: "Start date", field: "startDate", width: 150},
  {headerName: "Status", field: "status", width: 70},
];

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

   // let the grid know which columns and what data to use
   var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    rowHeight: 30
  };

  var gridDiv = document.querySelector('#gridTasks');
  new agGrid.Grid(gridDiv, gridOptions);
})