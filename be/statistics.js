console.log("statistics", new Date);

const moment = require('moment');
const mysql = require('mysql');

let connection = mysql.createConnection(require("./config.json").db);

connection.query("SELECT current_status, COUNT(0) AS count FROM games GROUP BY current_status", function (error, results, fields) {
    if (error) {
        throw error;
    }
    let statistics = {};
    results.forEach(function (row) {
        statistics[row.current_status] = row.count;
    });

    const date = moment(new Date).utc().subtract(1, "weeks").startOf("isoWeek");
    connection.query("SELECT COUNT(0) AS count FROM games WHERE giveaway_win_date BETWEEN ? AND ?", [date.format("YYYY-MM-DD HH:mm:ss"),
                                                                                                     date.clone().add(7, "days").format("YYYY-MM-DD HH:mm:ss")],
        function (error, results, fields) {
        if (error) {
            throw error;
        }
        statistics.win = results[0].count;
            statistics.statistics_date = date.format("YYYY-MM-DD");
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