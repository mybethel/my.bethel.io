'use strict';

/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
var app = angular.module('app', [
  'sails.io',
  'ngRoute',
  'google-maps'
]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/dashboard', {
      templateUrl: 'templates/dashboard.html',
      controller: 'DashboardController'
    }).
    when('/team', {
      templateUrl: 'templates/team.html',
      controller: 'TeamController'
    }).
    otherwise({
      redirectTo: '/dashboard'
    });
}]);
