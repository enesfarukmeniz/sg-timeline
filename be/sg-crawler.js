const request = require('request');
const cheerio = require('cheerio');
const JsonDB = require('node-json-db');

let database = new JsonDB("data/db", true, true);

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
            const dlcs = database.getData("/dlc");

            $(".giveaway__row-inner-wrap").each(function (i, el) {
                const $el = $(el);

                const steamid = $(".giveaway__heading a:nth-of-type(2)", $el).prop("href").replace(/^.*\/([0-9]+)\/$/, "$1");
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
                        game: {
                            name: $(".giveaway__heading__name", $el).html(),
                            steamid: steamid,
                            steamlink: $(".giveaway__heading a:nth-of-type(2)", $el).prop("href"),
                            image: $(".giveaway_image_thumbnail", $el).length ? $(".giveaway_image_thumbnail", $el).css("background-image").replace(/^url\((.*)\)$/, "$1") : ""
                        },
                        creator: {
                            name: $(".giveaway__username", $el).html(),
                            url: "https://www.steamgifts.com" + $(".giveaway__username", $el).prop("href"),
                            image: $(".giveaway_image_avatar", $el).css("background-image").replace(/^url\((.*)\)$/, "$1")
                        },
                        winDate: $(".giveaway__columns div:first-child span", $el).attr("data-timestamp"),
                        level: parseInt($(".giveaway__column--contributor-level", $el).length ? $(".giveaway__column--contributor-level", $el).html().replace(/^.*([0-9]+)\+$/, "$1") : 0),
                        types: types
                    });
                }
            });
            const nextPageLink = $(".pagination__navigation a");
            const lastPage = $(nextPageLink[nextPageLink.length - 1]).hasClass("is-selected");

            if (lastPage) {
                database.push("/sg-giveaways", giveaways);
            } else {
                sendRequest(++pageCount);
            }
        }
    });
}

sendRequest(1);