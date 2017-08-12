const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

let connection = mysql.createConnection(require("./config.json"));

let app = express();
app.use(cors());

app.get('/games', function (req, res) {
    connection.query('SELECT * FROM games', function (error, results, fields) {
        res.end(JSON.stringify(results));
    });
});

app.get('/statistics', function (req, res) {
    connection.query('SELECT * FROM statistics ORDER BY statistics_date DESC LIMIT 15', function (error, results, fields) {
        res.end(JSON.stringify(results));
    });
});

app.listen(8082);