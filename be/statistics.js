const JsonDB = require('node-json-db');
const moment = require('moment');

let database = new JsonDB("data/db", true, true);

const giveaways = database.getData("/sg-giveaways");
let sc_statuses = database.getData("/sc-status");
const manual_mark = database.getData("/manual-mark");
sc_statuses.beaten = sc_statuses.beaten.concat(manual_mark.beaten);
sc_statuses.blacklisted = sc_statuses.blacklisted.concat(manual_mark.blacklisted);

let statistics = {
    "blacklisted": 0,
    "beaten": 0,
    "active": 0,
    "played": 0
};

let flag;
for (giveaway of giveaways) {
    flag = false;
    for (stat of Object.keys(statistics)) {
        for (sc_status of sc_statuses[stat]) {
            if (giveaway.game.steamid == sc_status.steamid) {
                flag = true;
                statistics[stat]++;
                break;
            }
        }
        if (flag) {
            break;
        }
    }
}

delete statistics.played;
statistics.backlog = (giveaways.length) - (statistics.blacklisted + statistics.beaten + statistics.active);
database.push("/statistics/" + (moment(new Date).isoWeek() - 1), statistics);
