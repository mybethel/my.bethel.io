angular.module('Bethel.dashboard', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('beta', {
      url: '/beta',
      templateUrl: 'templates/dashboard/beta.html'
    });

});
