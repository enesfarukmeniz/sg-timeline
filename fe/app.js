var app = angular.module('sg-timeline', [
    'ngRoute',
    'ngSanitize',
    'angular-timeline',
    'angular-scroll-animate'
]);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "timeline.html"
        })
        .otherwise("/", {
            templateUrl: "timeline.html"
        });

    $locationProvider.html5Mode(true);
});

app.controller('AppController', function ($scope, $http) {
    $scope.events = [];

    $scope.badgeMap = {
        "active": "warning",
        "blacklisted": "danger",
        "beaten": "success",
        "played": "primary"
    };

    $scope.stats = {
        "blacklisted": 0,
        "beaten": 0,
        "active": 0,
        "played": 0 //for dummying
    }

    $http.get('http://localhost:8082/giveaways').then(function (response) {
        var giveaways = response.data;
        $http.get('http://localhost:8082/stats').then(function (response) {
            var stats = response.data;
            angular.forEach(giveaways, function (giveaway) {
                giveaway.game.image = giveaway.game.image ? giveaway.game.image : "http://cdn.akamai.steamstatic.com/steam/apps/582270/capsule_184x69.jpg";
                var event = {
                    badge: "primary",
                    title: giveaway.game.name,
                    when: moment(new Date(giveaway.winDate * 1000)).format("DD MMMM YYYY"),
                    titleContentHtml: '<a target="_blank" href="' + giveaway.game.steamlink + '"><img class="img-responsive" src="' + giveaway.game.image + '"></a>',
                    contentHtml: "<span style='color:#2d7c18;'>From <a target='_blank' href='" + giveaway.creator.url + "'>" + giveaway.creator.name + "</a></span>",
                    types: giveaway.types,
                    level: giveaway.level,
                    stat: null
                };

                angular.forEach(Object.keys($scope.badgeMap), function (key) {
                    angular.forEach(stats[key], function (stat) {
                        if (giveaway.game.steamid == stat.steamid) {
                            $scope.stats[key]++;
                            event.badge = $scope.badgeMap[key];
                            var duration = moment.duration({
                                minutes: stat.time
                            });
                            event.stat = {
                                type: key,
                                time: parseInt(duration.asHours()) + "h " + duration.minutes() + "m"
                            }
                        }
                    });
                });

                this.push(event);
            }, $scope.events);

        });

        $scope.reverse = function () {
            $scope.events.reverse()
        }
    });

    $scope.animateElementIn = function ($el) {
        $el.removeClass('timeline-hidden');
        $el.addClass('bounce-in');
    };

    $scope.animateElementOut = function ($el) {
        $el.addClass('timeline-hidden');
        $el.removeClass('bounce-in');
    };
});
