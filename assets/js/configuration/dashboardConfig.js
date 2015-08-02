angular.module('Bethel.dashboard', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('beta', {
      url: '/beta',
      templateUrl: 'templates/dashboard/beta.html'
    })
    .state('dashboard.location', {
      url: '/locations',
      templateUrl: 'templates/dashboard/locations.html',
      controller: 'LocationController'
    })
    .state('dashboard.location.edit', {
      url: '/edit/:locationId',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationEditController'
    })
    .state('dashboard.location.new', {
      url: '/new',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationEditController'
    })
    .state('dashboard.billing', {
      url: '/billing',
      templateUrl: 'templates/dashboard/billing.html'
    })
    .state('dashboard.accounts', {
      url: '/accounts',
      templateUrl: 'templates/dashboard/services.html',
      controller: 'ServicesController'
    });

});
