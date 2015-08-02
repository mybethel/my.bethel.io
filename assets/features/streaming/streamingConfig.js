angular.module('Bethel.streaming', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('streaming', {
      url: '/streaming',
      templateUrl: 'features/streaming/streamingView.html'
    });

}]);
