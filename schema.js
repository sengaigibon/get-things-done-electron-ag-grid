const { sqlite3 } = require('sqlite3');

const _dbDir = 'db'
const _dbName = 'get_things_done.sqlite'
const _dbPath = _dbDir + '/' + _dbName;

var _sqlite3;

const tableTasks = "create table tasks (" + 
    "taskId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "tag VARCHAR(32) DEFAULT ''," +
    "title VARCHAR(254) NOT NULL," +
    "startDate DATETIME NOT NULL," +
    "dueDate VARCHAR(32) DEFAULT ''," +
    "status VARCHAR(32) DEFAULT 'idle'," +
    "totalTime TIME DEFAULT 0" +
    ")";

const tableTaskTracker =  "create table taskTracker (" +
    "trackId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "taskId INT NOT NULL," +
    "start DATETIME NOT NULL," +
    "stop DATETIME," +
    "total INTEGER DEFAULT 0," +
    "FOREIGN KEY (taskId) REFERENCES tasks(taskId)" +
    ")";

const tableTaskHistory = "create table taskHistory (" +
    "taskId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "tag VARCHAR(32) DEFAULT NULL," +
    "title VARCHAR(254) NOT NULL," +
    "startDate DATETIME NOT NULL," +
    "dueDate VARCHAR(32) DEFAULT NULL," +
    "status VARCHAR(32) DEFAULT 'idle'," +
    "totalTime TIME DEFAULT 0" +
    ")";

const viewSummary = "CREATE VIEW summary as select t.title, sum(tt.total) from tasks t join taskTracker tt on tt.taskId = t.taskId group by t.title";

const viewSummaryTwo = "CREATE VIEW summary2 as select t.title as title, sum(tt.total) as total from tasks t join taskTracker tt on tt.taskId = t.taskId group by t.title";

function createDB () 
{
    let db = new _sqlite3.Database(_dbPath);

    console.log("Creating DB schema...");
    db.serialize(function() {
        db.run(tableTasks);
        db.run(tableTaskTracker);
        db.run(tableTaskHistory);
        db.run(viewSummary);
        db.run(viewSummaryTwo);
    });
    console.log("DB schema creation OK");

    db.close();
}

exports.initDb = function() {
    _sqlite3 = require('sqlite3').verbose();
    var fs = require('fs');
    
    if (!fs.existsSync(_dbDir)) {
      fs.mkdirSync(_dbDir);
    }

    if (!fs.existsSync(_dbPath)) {
      createDB();
    } 
};

