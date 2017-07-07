const express = require('express');
const JsonDB = require('node-json-db');
const cors = require('cors');

let app = express();
app.use(cors());

app.get('/giveaways', function (req, res) {
    let database = new JsonDB("data/db", true, true);
    res.end(JSON.stringify(database.getData("/sg-giveaways")));
});

app.get('/stats', function (req, res) {
    let database = new JsonDB("data/db", true, true);
    res.end(JSON.stringify(database.getData("/sc-status")));
});

const server = app.listen(8082, function () {

    const host = server.address().address
    const port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});