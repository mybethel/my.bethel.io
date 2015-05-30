angular.module('Bethel.dashboard', ['ui.router', 'uiGmapgoogle-maps'])

.config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

  $stateProvider
    .state('beta', {
      url: '/beta',
      templateUrl: 'templates/dashboard/beta.html'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard/index.html',
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

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCasoNnO-7ZHrH_NBcCU_BBed6duq8NvJg',
    v: '3.17',
    libraries: 'places'
  });

});
