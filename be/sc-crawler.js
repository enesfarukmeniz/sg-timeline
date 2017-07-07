const request = require('request');
const cheerio = require('cheerio');
const JsonDB = require('node-json-db');

let database = new JsonDB("data/db", true, true);

var beaten = [],
    blacklisted = [],
    played = [],
    active = [];
request({
    url: "http://www.steamcompletionist.net/76561198047206902/",
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3053.3 Safari/537.36',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': 1,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'DNT': 1,
        'Accept-Language': 'en-US,en;q=0.8,tr;q=0.6'
    }
}, function (error, response, body) {
    if (!error) {
        const $ = cheerio.load(body);
        $(".list_boxes div").each(function (i, el) {
            $el = $(el);
            if ($el.hasClass("beaten")) {
                beaten.push({
                    steamid: $el.prop("id"),
                    time: $("img", $el).attr("data-minutestotal")
                });
            }
            if ($el.hasClass("blacklisted")) {
                blacklisted.push({
                    steamid: $el.prop("id"),
                    time: $("img", $el).attr("data-minutestotal")
                });
            }
            if ($el.attr("class") == "list_box") {
                played.push({
                    steamid: $el.prop("id"),
                    time: $("img", $el).attr("data-minutestotal")
                });
            }
        });

        $(".game_box").each(function (i, el) {
            $el = $(el);
            active.push({
                steamid: $("img", $el).attr("data-gameid"),
                time: $("img", $el).attr("data-minutestotal")
            });

        });

        database.push("/sc-status", {
            beaten: beaten,
            blacklisted: blacklisted,
            played: played,
            active: active
        });
    }
});
