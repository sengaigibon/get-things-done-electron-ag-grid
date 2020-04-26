const _SQLITE3 = require('sqlite3').verbose();
const _DATE_FORMAT = require('dateformat');

const DB_DIR = 'db'
const DB_NAME = 'get_things_done.sqlite'
const DB_PATH = DB_DIR + '/' + DB_NAME;

const TABLE_TASKS = "CREATE TABLE tasks (" +
    "taskId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "tag VARCHAR(32) DEFAULT ''," +
    "title VARCHAR(254) NOT NULL," +
    "startDate DATETIME NOT NULL," +
    "dueDate VARCHAR(32) DEFAULT ''," +
    "status VARCHAR(32) DEFAULT 'idle'," +
    "totalTime TIME DEFAULT 0" +
    ")";

const TABLE_TASK_TRACKER =  "CREATE TABLE taskTracker (" +
    "trackId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "taskId INT NOT NULL," +
    "start DATETIME NOT NULL," +
    "stop DATETIME," +
    "total INTEGER DEFAULT 0," +
    "FOREIGN KEY (taskId) REFERENCES tasks(taskId)" +
    ")";

const TABLE_TASK_HISTORY = "CREATE TABLE taskHistory (" +
    "taskId INTEGER PRIMARY KEY AUTOINCREMENT," +
    "tag VARCHAR(32) DEFAULT NULL," +
    "title VARCHAR(254) NOT NULL," +
    "startDate DATETIME NOT NULL," +
    "dueDate VARCHAR(32) DEFAULT NULL," +
    "status VARCHAR(32) DEFAULT 'idle'," +
    "totalTime TIME DEFAULT 0" +
    ")";

const VIEW_SUMMARY = "CREATE VIEW summary as select t.title, sum(tt.total) FROM tasks t JOIN taskTracker tt ON tt.taskId = t.taskId GROUP BY t.title";

const VIEW_SUMMARY_TWO = "CREATE VIEW summary2 as select t.title as title, sum(tt.total) as total FROM tasks t JOIN taskTracker tt ON tt.taskId = t.taskId where tt.start > date() GROUP BY t.title";

/**** General queries */
const SELECT_ALL_INCOMPLETE = "SELECT * from tasks WHERE status != 'completed' ORDER BY taskId DESC";
const SELECT_TODAYS_TASKS = "SELECT t.title as title, sum(tt.total) as total " + 
                            "FROM tasks t JOIN taskTracker tt ON tt.taskId = t.taskId " + 
                            "WHERE tt.start > date() " + 
                            "GROUP BY t.taskId";

/**** End general queries */

let _db = null;

/**
 * Create DB schema
 */
function createDB ()
{
    let db = this.getDB();

    console.log("Creating DB schema...");
    db.serialize(function() {
        db.run(TABLE_TASKS);
        db.run(TABLE_TASK_TRACKER);
        db.run(TABLE_TASK_HISTORY);
        db.run(VIEW_SUMMARY);
        db.run(VIEW_SUMMARY_TWO);
    });
    console.log("DB schema creation OK");

    db.close();
}

/**
 * 
 * @param {*} initial 
 */
function getDateFormatted(initial = null)
{
    return _DATE_FORMAT(initial ? initial : new Date(), "yyyy-mm-dd HH:MM:ss");
}

/**
 * Exectute sql scripts
 *
 * @param {string} sql
 * @param {object} context
 * @param {function} callback
 */
function run(sql, context, callback)
{
    let db = context.getDB();

    db.run(sql, [], callback);
}



exports.statusIdle = 'idle';
exports.statusActive = 'active';
exports.statusCompleted = 'completed';

exports.getSQL = function() {
    return _SQLITE3;
};

/**
 * @returns {sqlite3.Database}  
 */
exports.getDB = function(){
    if (!_db) {
        _db = new _SQLITE3.Database(DB_PATH);
    }
    return _db;
};

/**
 * Initialize DB location and schema
 */
exports.initDb = function() {
    var fs = require('fs');

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR);
    }

    if (!fs.existsSync(DB_PATH)) {
      createDB();
    }
};

exports.getAllRows = function(callback) {
    let db = this.getDB();

    db.all(SELECT_ALL_INCOMPLETE, [], callback);
};

exports.insertNew = function (taskTag, taskName, callback) {
    let sql = "INSERT INTO tasks(taskId, tag, title, startDate) VALUES (null, '" + taskTag + "', '" + taskName + "', '" + getDateFormatted() + "')";

    run(sql, this, callback);
};

exports.updateStatus = function (taskId, status, callback) {
    let sql = "UPDATE tasks SET status = '" + status + "' WHERE taskId = '" + taskId + "'";

    run(sql, this, callback);
};

exports.startTracking = function (taskId, callback) {
    let sql = "INSERT INTO taskTracker(trackId, taskId, start) VALUES(null, " + taskId + ", datetime('now'))";

    run(sql, this, callback);
};

exports.stopTracking = function (taskId, callback) {
    let sql = "SELECT start FROM taskTracker WHERE taskId = '" + taskId + "' order by trackId desc limit 1";

    let db = this.getDB();
    db.get(sql, [], function(err, row) {
        if (err) {
            console.log(err.message);
            return false;
        }

        var start = new Date(row.start);
        var stop = new Date();
        var total = Math.floor((stop.getTime() - start.getTime()) / 1000); //difference in secods

        let sql = "UPDATE taskTracker SET stop = '" + getDateFormatted(stop) +"', total = " + total + " WHERE taskId = '" + taskId + "'";

        db.run(sql, [], callback);
    });
};

exports.getTasksByDate = function (period = 'today', startDate = null, stopDate = null, callback) {
    let db = this.getDB();

    var query;
    if (period == 'today') {
        query = SELECT_TODAYS_TASKS;
    }

    db.all(query, [], callback);
}