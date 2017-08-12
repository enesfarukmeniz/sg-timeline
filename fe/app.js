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
        $scope.events = [];
        var badgeMap = {
            "active": "warning",
            "blacklisted": "danger",
            "beaten": "success",
            "backlog": "primary"
        };

        $http.get(remote + '/games').then(function (response) {
            angular.forEach(response.data, function (game) {
                if (game.game_image_url == null) {
                    game.game_image_url = "capsule_qm.png";
                }
                game.types = game.types.split(",");
                game.badge = badgeMap[game.current_status];
                game.giveaway_win_date = moment(game.giveaway_win_date).format("DD MMMM YYYY");
                if (game.playtime != -1) {
                    var duration = moment.duration({
                        minutes: game.playtime
                    });
                    game.playtime = parseInt(duration.asHours()) + "h " + duration.minutes() + "m";
                }
                else {
                    game.playtime = "N/A";
                }
                this.push(game);
            }, $scope.events);
        });

        $scope.chartDummyData = [[null], [null], [null], [null], [null]];

        $http.get(remote + '/statistics').then(function (response) {

            $scope.chartLabels = [];
            var chartData = {
                "blacklisted": [],
                "beaten": [],
                "active": [],
                "backlog": [],
                "win": []
            };

            angular.forEach(response.data, function (statistic) {
                $scope.chartLabels.unshift("Week " + (moment(statistic.statistics_date).isoWeek()));
                angular.forEach(Object.keys(chartData), function (chartDataKey) {
                    chartData[chartDataKey].unshift(statistic[chartDataKey]);
                });
            });

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
