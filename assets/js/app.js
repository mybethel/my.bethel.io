'use strict';

/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
var app = angular.module('app', [
  'http-auth-interceptor',
  'sails.io',
  'ui.router',
  'google-maps'
]);

app.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard/dashboard.html',
      controller: 'DashboardController'
    })
    .state('dashboard.location', {
      url: '/locations',
      templateUrl: 'templates/dashboard/locations.html',
      controller: 'LocationController'
    })
    .state('dashboard.location.edit', {
      url: '/edit/:locationId',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationFormController'
    })
    .state('dashboard.location.new', {
      url: '/new',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationFormController'
    })
    .state('dashboard.billing', {
      url: '/billing',
      templateUrl: 'templates/dashboard/billing.html'
    })
    .state('dashboard.accounts', {
      url: '/accounts',
      templateUrl: 'templates/dashboard/accounts.html',
      controller: 'AccountsController'
    });

});

function findIndexByPropertyValue(arr, property, value) {
  var index = null;
  for (var i in arr) {
    if (arr[i][property] == value) {
      index = i;
      break;
    }
  }
  return index;
}
