const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const mysql = require('mysql');

let connection = mysql.createConnection(require("./config.json"));

let giveaways = [];

function sendRequest(pageCount) {
    request({
        url: "https://www.steamgifts.com/user/morikalina/giveaways/won/search?page=" + pageCount,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3053.3 Safari/537.36',
            'Host': 'www.steamgifts.com',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Upgrade-Insecure-Requests': 1,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'DNT': 1,
            'Accept-Language': 'en-US,en;q=0.8,tr;q=0.6',
            'Cookie': 'PHPSESSID=1'
        }
    }, function (error, response, body) {
        if (!error) {
            const $ = cheerio.load(body);

            connection.query('SELECT steam_id FROM dlcs', function (error, results, fields) {
                if (error) throw error;
                const dlcs = results.map(function (row) {
                    return row.steam_id;
                });

                $(".giveaway__row-inner-wrap").each(function (i, el) {
                    const $el = $(el);

                    const steamid = parseInt($(".giveaway__heading a:nth-of-type(2)", $el).prop("href").replace(/^.*\/([0-9]+)\/$/, "$1"));
                    if (dlcs.indexOf(steamid) == -1) {
                        let types = [];
                        if ($(".giveaway__columns .giveaway__column--whitelist", $el).length) {
                            types.push("whitelist");
                        }
                        if ($(".giveaway__columns .giveaway__column--group", $el).length) {
                            types.push("group");
                        }
                        if ($(".giveaway__columns .giveaway__column--invite-only", $el).length) {
                            types.push("private");
                        }
                        if (!types.length) {
                            types.push("public");
                        }
                        if ($(".giveaway__columns .giveaway__column--region-restricted", $el).length) {
                            types.push("region");
                        }
                        giveaways.push({
                            steam_id: steamid,
                            steam_link: $(".giveaway__heading a:nth-of-type(2)", $el).prop("href"),
                            game_name: $(".giveaway__heading__name", $el).html(),
                            game_image_url: $(".giveaway_image_thumbnail", $el).length ? $(".giveaway_image_thumbnail", $el).css("background-image").replace(/^url\((.*)\)$/, "$1") : null,
                            creator_name: $(".giveaway__username", $el).html(),
                            creator_profile_url: "https://www.steamgifts.com" + $(".giveaway__username", $el).prop("href"),
                            creator_image_url: $(".giveaway_image_avatar", $el).css("background-image").replace(/^url\((.*)\)$/, "$1"),
                            giveaway_win_date: moment.unix($(".giveaway__columns div:first-child span", $el).attr("data-timestamp")).format("YYYY-MM-DD"),
                            giveaway_level: parseInt($(".giveaway__column--contributor-level", $el).length ? $(".giveaway__column--contributor-level", $el).html().replace(/^.*([0-9]+)\+$/, "$1") : 0),
                            types: types.join(',')
                        });
                    }
                });
                const nextPageLink = $(".pagination__navigation a");
                const lastPage = $(nextPageLink[nextPageLink.length - 1]).hasClass("is-selected");

                if (lastPage) {
                    giveaways = giveaways.map(function (giveaway) {
                        return Object.values(giveaway);
                    });
                    const query = 'INSERT IGNORE INTO games'
                        + '(steam_id, steam_link, game_name, game_image_url, creator_name, creator_profile_url, creator_image_url, giveaway_win_date, giveaway_level, types) VALUES ?';
                    connection.query(query, [giveaways], function (error, results, fields) {
                        if (error) throw error;
                    });
                    connection.end();
                } else {
                    sendRequest(++pageCount);
                }
            });
        }
    });
}

sendRequest(1);