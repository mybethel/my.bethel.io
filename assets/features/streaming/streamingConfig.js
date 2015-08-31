angular.module('Bethel.streaming', ['ui.router'])
.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('streaming', {
      url: '/streaming',
      templateUrl: 'features/streaming/streamingView.html'
    });

}]);
