'use strict';

/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
var app = angular.module('app', [
  'sails.io',
  'ui.router',
  'google-maps'
]);

app.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard.html',
      controller: 'DashboardController'
    })
    .state('dashboard.location', {
      url: '/locations',
      templateUrl: 'templates/locations.html',
      controller: 'LocationController'
    });

});
