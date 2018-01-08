console.log("sc-crawler", new Date);

const request = require('request');
const cheerio = require('cheerio');
const mysql = require('mysql');

let connection = mysql.createConnection(require("./config.json").db);

request({
    //url: "http://www.steamcompletionist.net/76561198047206902/",
    url: "http://www.sc.meniz.io/76561198047206902/",
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
            const $el = $(el);
            let status = null;

            if ($el.hasClass("beaten")) {
                status = "beaten";
            }
            if ($el.hasClass("blacklisted")) {
                status = "blacklisted";
            }
            if ($el.attr("class") == "list_box" || $el.attr("class") == "list_box unplayed") {
                status = "backlog";
            }
            if (status) {
                connection.query("UPDATE games SET current_status = ?, playtime = ? WHERE steam_id_real = ?", [status, $("img", $el).attr("data-minutestotal"), $el.prop("id")],
                    function (error, results, fields) {
                        if (error) {
                            throw error;
                        }
                    });
            }
        });

        $(".game_box").each(function (i, el) {
            const $el = $(el);
            connection.query("UPDATE games SET current_status = 'active', playtime = ? WHERE steam_id_real = ?", [$("img", $el).attr("data-minutestotal"), $("img", $el).attr("data-gameid")],
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                });
        });
        connection.end();
    } else {
        console.log(error);
    }
});

process.on('unhandledRejection', function (error, promise) {
    console.log(error);
});