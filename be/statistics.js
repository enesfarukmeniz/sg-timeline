const JsonDB = require('node-json-db');
const moment = require('moment');

let database = new JsonDB("data/db", true, true);

const giveaways = database.getData("/sg-giveaways");
let sc_statuses = database.getData("/sc-status");
const manual_mark = database.getData("/manual-mark");
const dlcs = database.getData("/dlc");
sc_statuses.beaten = sc_statuses.beaten.concat(manual_mark.beaten);
sc_statuses.blacklisted = sc_statuses.blacklisted.concat(manual_mark.blacklisted);

let statistics = {
    "blacklisted": 0,
    "beaten": 0,
    "active": 0,
    "played": 0
};

let flag, dlc_ga;
for (giveaway of giveaways) {
    dlc_ga = false;
    for (dlc of dlcs) {
        if (dlc == giveaway.game.steamid) {
            dlc_ga = true;
            break;
        }
    }

    if (dlc_ga) {
        continue;
    }

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
statistics.backlog = (giveaways.length - dlcs.length) - (statistics.blacklisted + statistics.beaten + statistics.active);
let statistic_data = {};
statistic_data[moment(new Date).isoWeek()] = statistics;

database.push("/statistics", statistic_data);
