angular.module('Bethel.streaming', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', 'uiGmapGoogleMapApiProvider', function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

  $stateProvider
    .state('streaming', {
      url: '/streaming',
      templateUrl: 'features/streaming/streamingView.html'
    });

}]);
