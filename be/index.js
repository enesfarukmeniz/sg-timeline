const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const config = require("./config.json");

let connection = mysql.createConnection(config.db);

let app = express();
app.use(cors());

app.get('/games', function (req, res) {
    connection.query('SELECT * FROM games ORDER BY giveaway_win_date DESC', function (error, results, fields) {
        res.end(JSON.stringify(results));
    });
});

app.get('/statistics', function (req, res) {
    connection.query('SELECT * FROM statistics ORDER BY statistics_date DESC LIMIT 15', function (error, results, fields) {
        res.end(JSON.stringify(results));
    });
});

app.listen(config.listen);