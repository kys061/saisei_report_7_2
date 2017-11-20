'use strict';

var reportApp = angular.module('reportApp', [
    "ngRoute", 'base64', 'chart.js', 'angular-momentjs', 'angular-loading-bar',
    'angularjs-datetime-picker', 'angularjs-dropdown-multiselect'
])
    .config(function($routeProvider, $locationProvider, $momentProvider) {
        $momentProvider
            .asyncLoading(false)
            .scriptUrl('./lib/moment.min.js');
        $routeProvider
            // .when('/', {
            //     templateUrl: "index.html",
            //     controller: "MainCtrl"
            // })
            .when('/report', {
                templateUrl: "templates/report.html",
                controller: "ReportCtrl"
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 1200;
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
    }]).run(function($rootScope) {
        $rootScope.users_app_top1 = [];
    });