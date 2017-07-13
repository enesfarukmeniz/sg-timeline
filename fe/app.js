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
    };

    $http.get('http://localhost:8082/giveaways').then(function (response) {
        var giveaways = response.data;
        $http.get('http://localhost:8082/stats').then(function (response) {
            var stats = response.data;
            angular.forEach(giveaways, function (giveaway) {
                giveaway.game.image = giveaway.game.image ? giveaway.game.image : "capsule_qm.png";
                var event = {
                    badge: "primary",
                    game: giveaway.game,
                    when: moment(new Date(giveaway.winDate * 1000)).format("DD MMMM YYYY"),
                    creator: giveaway.creator,
                    types: giveaway.types,
                    level: giveaway.level,
                    stat: {
                        time: "0h 0m"
                    }
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
                                time: duration.isValid() ? (parseInt(duration.asHours()) + "h " + duration.minutes() + "m") : "N/A"
                            }
                        }
                    });
                });

                this.push(event);
            }, $scope.events);

        });
    });

    $scope.eventKeys = {
        warning: true,
        danger: true,
        success: true,
        primary: true
    };

    $scope.toggle = function (key) {
        $scope.eventKeys[key] = !$scope.eventKeys[key];
    };

    $scope.reversed = false;
    $scope.reverse = function () {
        $scope.events.reverse();
        $scope.reversed = !$scope.reversed;
    };

    $scope.eventFilterer = function (event) {
        return $scope.eventKeys[event.badge];
    };

    $scope.animateElementIn = function ($el) {
        $el.removeClass('timeline-hidden');
        $el.addClass('bounce-in');
    };

    $scope.animateElementOut = function ($el) {
        $el.addClass('timeline-hidden');
        $el.removeClass('bounce-in');
    };
});
