const express = require('express');
const mysql = require('mysql');
const moment = require('moment');

const config = require("./config.json");

let connection = mysql.createConnection(config.db);

let app = express();

app.use(express.static(__dirname + '/public'));

app.get('/games', function (req, res) {
    connection.query('SELECT * FROM games ORDER BY giveaway_win_date DESC', function (error, results, fields) {
        res.end(JSON.stringify(results));
    });
});

app.get('/statistics/weekly', function (req, res) {
    connection.query('SELECT * FROM statistics_weekly ORDER BY statistics_date DESC LIMIT 17', function (error, results, fields) {
        let statistics = results;
        connection.query("SELECT current_status, COUNT(0) AS count FROM games GROUP BY current_status", function (error, results, fields) {
            if (error) {
                throw error;
            }
            let statistic = {};
            results.forEach(function (row) {
                statistic[row.current_status] = row.count;
            });

            const date = moment(new Date).utc().startOf("isoWeek");
            connection.query("SELECT COUNT(0) AS count FROM games WHERE giveaway_win_date BETWEEN ? AND ?", [date.format("YYYY-MM-DD HH:mm:ss"),
                                                                                                             date.clone().add(7, "days").format("YYYY-MM-DD HH:mm:ss")],
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                    statistic.win = results[0].count;
                    statistics.unshift(statistic);
                    res.end(JSON.stringify(statistics));
                });
        });
    });
});

app.get('/statistics/monthly', function (req, res) {
    connection.query('SELECT * FROM statistics_monthly ORDER BY statistics_date DESC LIMIT 17', function (error, results, fields) {
        let statistics = results;
        connection.query("SELECT current_status, COUNT(0) AS count FROM games GROUP BY current_status", function (error, results, fields) {
            if (error) {
                throw error;
            }
            let statistic = {};
            results.forEach(function (row) {
                statistic[row.current_status] = row.count;
            });

            const date = moment(new Date).utc().startOf("month");
            connection.query("SELECT COUNT(0) AS count FROM games WHERE giveaway_win_date BETWEEN ? AND ?", [date.format("YYYY-MM-DD HH:mm:ss"),
                                                                                                             date.clone().add(1, "months").format("YYYY-MM-DD HH:mm:ss")],
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                    statistic.win = results[0].count;
                    statistics.unshift(statistic);
                    res.end(JSON.stringify(statistics));
                });
        });
    });
});

app.listen(config.listen);