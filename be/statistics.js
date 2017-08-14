console.log(new Date);

const moment = require('moment');
const mysql = require('mysql');
moment.locale("tr");

let connection = mysql.createConnection(require("./config.json").db);

connection.query("SELECT current_status, COUNT(0) AS count FROM games GROUP BY current_status", function (error, results, fields) {
    if (error) {
        throw error;
    }
    let statistics = {};
    results.forEach(function (row) {
        statistics[row.current_status] = row.count;
    });

    const date = moment(new Date).subtract(1, "weeks");
    connection.query("SELECT COUNT(0) AS count FROM games WHERE giveaway_win_date BETWEEN ? AND ?", [date.startOf("week").format("YYYY-MM-DD"),
        date.endOf("week").format("YYYY-MM-DD")], function (error, results, fields) {
        if (error) {
            throw error;
        }
        statistics.win = results[0].count;
        statistics.statistics_date = date.startOf("week").format("YYYY-MM-DD");
        connection.query('INSERT INTO statistics SET ?', statistics, function (error, results, fields) {
            if (error) {
                throw error;
            }
        });

        connection.end();
    });
});

process.on('unhandledRejection', function (error, promise) {
    console.log(error);
});