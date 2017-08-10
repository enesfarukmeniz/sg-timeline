var app = angular.module('sg-timeline', [
    'ngRoute',
    'ngSanitize',
    'angular-timeline',
    'angular-scroll-animate',
    'chart.js'
]);

app.config(function ($routeProvider, $locationProvider, ChartJsProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "timeline.html"
        })
        .otherwise("/", {
            templateUrl: "timeline.html"
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    ChartJsProvider.setOptions('line', {
        showLines: false
    });
});

app.controller('AppController', function ($scope, $http) {
    $http.get("/config.json").then(function (response) {
        var remote = response.data.remote;

        var WEEK_COUNT = 15;

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

        $http.get(remote + '/giveaways').then(function (response) {
            var giveaways = response.data;
            $http.get(remote + '/stats').then(function (response) {
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

        $scope.chartDummyData = [[null], [null], [null], [null], [null]];
        $http.get(remote + '/statistics').then(function (response) {
            var data = response.data;

            $scope.chartLabels = [];
            for (var i = WEEK_COUNT; i > 0; i--) {
                $scope.chartLabels.push("Week " + (moment(new Date).isoWeek() - i));
            }

            var chartData = {
                "blacklisted": [],
                "beaten": [],
                "active": [],
                "backlog": [],
                "win": []
            };
            for (var i = 1; i <= WEEK_COUNT; i++) {
                var week = moment(new Date).isoWeek() - i;

                angular.forEach(Object.keys(chartData), function (key) {
                    if (data[week] && data[week][key]) {
                        chartData[key].unshift(data[week][key])
                    } else {
                        chartData[key].unshift(0);
                    }
                });
            }

            $scope.chartDatasetOverride = [
                {
                    label: "Wins",
                    borderWidth: 0,
                    type: 'line',
                    pointBorderColor: "#000000",
                    borderColor: "#000000",
                    pointHoverBackgroundColor: "#ffffff",
                    data: chartData.win
                },
                {
                    label: "Beaten",
                    type: 'bar',
                    backgroundColor: "#3f903f",
                    hoverBackgroundColor: "#00ff00",
                    borderColor: "#fff",
                    stack: "Stack 0",
                    borderWidth: 0,
                    data: chartData.beaten
                },
                {
                    label: "Blacklisted",
                    type: 'bar',
                    backgroundColor: "#d9534f",
                    hoverBackgroundColor: "#ff0000",
                    borderColor: "#fff",
                    stack: "Stack 0",
                    borderWidth: 0,
                    data: chartData.blacklisted
                },
                {
                    label: "Backlog",
                    type: 'bar',
                    backgroundColor: "#2e6da4",
                    hoverBackgroundColor: "#0000ff",
                    borderColor: "#fff",
                    stack: "Stack 1",
                    borderWidth: 0,
                    data: chartData.backlog
                },
                {
                    label: "Active",
                    type: 'bar',
                    backgroundColor: "#f0ad4e",
                    hoverBackgroundColor: "#ffff00",
                    borderColor: "#fff",
                    stack: "Stack 1",
                    borderWidth: 0,
                    data: chartData.active
                }
            ];

            $scope.chartOptions = {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            };
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
});
