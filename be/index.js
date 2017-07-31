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
    let sc_status = database.getData("/sc-status");
    const manual_mark = database.getData("/manual-mark");
    //TODO change manual mark logic for bundles/packs/collections
    sc_status.beaten = sc_status.beaten.concat(manual_mark.beaten);
    sc_status.blacklisted = sc_status.blacklisted.concat(manual_mark.blacklisted);
    res.end(JSON.stringify(sc_status));
});

app.get('/statistics', function (req, res) {
    let database = new JsonDB("data/db", true, true);
    res.end(JSON.stringify(database.getData("/statistics")));
});

const server = app.listen(8082, function () {

    const host = server.address().address;
    const port = server.address().port;

});
