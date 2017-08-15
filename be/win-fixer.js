console.log("win-fixer", new Date);

const moment = require('moment');
const mysql = require('mysql');

let connection = mysql.createConnection(require("./config.json").db);

connection.query("SELECT statistics_date FROM statistics ORDER BY statistics_date DESC LIMIT 4", function (error, results, fields) {
    if (error) {
        throw error;
    }
    results.forEach(function (row, index, arr) {
        const date = moment(row.statistics_date);
        connection.query("SELECT COUNT(0) AS count FROM games WHERE giveaway_win_date BETWEEN ? AND ?", [date.format("YYYY-MM-DD HH:mm:ss"),
                                                                                                         date.clone().add(7, "days").format("YYYY-MM-DD HH:mm:ss")],
            function (error, results, fields) {
                if (error) {
                    throw error;
                }
                connection.query('UPDATE statistics SET win = ? WHERE statistics_date = ?', [results[0].count,
                                                                                             date.format("YYYY-MM-DD")], function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                    if (index == arr.length - 1) {
                        connection.end();
                    }
                });
            });
    });

});

process.on('unhandledRejection', function (error, promise) {
    console.log(error);
});
