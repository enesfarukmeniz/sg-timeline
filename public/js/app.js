let app = angular.module('sg-timeline', [
    'ngRoute',
    'ngSanitize',
    'angular-timeline',
    'angular-scroll-animate'
]);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/timeline.html"
        })
        .otherwise("/", {
            templateUrl: "views/timeline.html"
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.controller('AppController', function ($scope, $http, $timeout) {
    $scope.events = [];
    const badgeMap = {
        "active": "warning",
        "blacklisted": "danger",
        "beaten": "success",
        "backlog": "primary"
    };

    $http.get('/games').then(function (response) {
        angular.forEach(response.data, function (game) {
            if (game.game_image_url == null) {
                game.game_image_url = "img/capsule_qm.png";
            }
            game.types = game.types.split(",");
            game.badge = badgeMap[game.current_status];
            game.giveaway_win_date = moment(game.giveaway_win_date).utc().format("DD MMMM YYYY");
            if (game.playtime != -1) {
                const duration = moment.duration({
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

    function realNum(val) {
        return val ? val : 0;
    }

    function createChart(chartTitle, chartId, chartLabels, chartData, intervalTotalData) {
        $timeout(function () {
            new Chart(document.getElementById(chartId), {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
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
                    ]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: chartTitle,
                        fontSize: 22
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        titleFontSize: 14,
                        bodyFontStyle: 'bold',
                        multiKeyBackground: "#000",
                        bodySpacing: 6,
                        callbacks: {
                            label: function (tooltipItem, data) {
                                const label = data.datasets[tooltipItem.datasetIndex].label;
                                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                value = value ? value : 0;
                                if (data.datasets[tooltipItem.datasetIndex].type == "line") {
                                    return label + ": " + value;
                                }
                                const percentage = intervalTotalData[tooltipItem.index] ? (100 * value / intervalTotalData[tooltipItem.index]).toFixed(1) : 0;
                                return label + ": " + value + " - " + percentage + "%";
                            }
                        }
                    },
                    hover: {
                        mode: 'index',
                        intersect: false
                    }
                }
            });
        }, 500);
    }

    $http.get('/statistics/weekly').then(function (response) {

        let chartLabels = [];
        let chartData = {
            "blacklisted": [],
            "beaten": [],
            "active": [],
            "backlog": [],
            "win": []
        };

        angular.forEach(response.data, function (statistic) {
            chartLabels.unshift("Week " + (moment(statistic.statistics_date).isoWeek()));
            angular.forEach(Object.keys(chartData), function (chartDataKey) {
                chartData[chartDataKey].unshift(statistic[chartDataKey]);
            });
        });
        chartLabels[chartLabels.length - 1] = "Current";

        const intervalTotalData = response.data.reverse().map(function (row) {
            return realNum(row.blacklisted) + realNum(row.beaten) + realNum(row.backlog) + realNum(row.active);
        });

        const chartTitle = "Weekly Statistics";
        const chartId = "statisticsWeeklyChart";
        createChart(chartTitle, chartId, chartLabels, chartData, intervalTotalData);
    });

    $http.get('/statistics/monthly').then(function (response) {

        let chartLabels = [];
        let chartData = {
            "blacklisted": [],
            "beaten": [],
            "active": [],
            "backlog": [],
            "win": []
        };

        angular.forEach(response.data, function (statistic) {
            chartLabels.unshift((moment(statistic.statistics_date).format("MMMM YY")));
            angular.forEach(Object.keys(chartData), function (chartDataKey) {
                chartData[chartDataKey].unshift(statistic[chartDataKey]);
            });
        });
        chartLabels[chartLabels.length - 1] = "Current (" + moment().format("MMMM YY") + ")";

        const intervalTotalData = response.data.reverse().map(function (row) {
            return realNum(row.blacklisted) + realNum(row.beaten) + realNum(row.backlog) + realNum(row.active);
        });

        const chartTitle = "Monthly Statistics";
        const chartId = "statisticsMonthlyChart";
        createChart(chartTitle, chartId, chartLabels, chartData, intervalTotalData);
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

//thx https://gist.github.com/michalkvasnicak/71101854cd9d6fbb7cf2
app.directive('imageLazySrc', function ($document, $window) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attributes) {

            function isInView() {
                // get current viewport position and dimensions, and image position
                const clientHeight = $document[0].documentElement.clientHeight,
                    clientWidth = $document[0].documentElement.clientWidth,
                    imageRect = $element[0].getBoundingClientRect();

                if ((imageRect.top >= 0 && imageRect.bottom <= clientHeight)
                    && (imageRect.left >= 0 && imageRect.right <= clientWidth)) {
                    $element[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)

                    // unbind event listeners when image src has been set
                    removeEventListeners();
                }
            }

            function removeEventListeners() {
                $window.removeEventListener('scroll', isInView);
                $window.removeEventListener('resize', isInView);
            }

            // bind scroll and resize event listener to window
            $window.addEventListener('scroll', isInView);
            $window.addEventListener('resize', isInView);

            // unbind event listeners if element was destroyed
            // it happens when you change view, etc
            $element.on('$destroy', function () {
                removeEventListeners();
            });

            // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
            isInView();
        }
    };
});