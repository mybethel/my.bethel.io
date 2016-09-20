angular.module('Bethel.podcast', ['Bethel.util', 'chart.js', 'mgo-angular-wizard'])
.config(['$stateProvider', function($stateProvider) {

  $stateProvider
    .state('podcast', {
      url: '/podcast',
      templateUrl: 'features/podcast/podcastListView.html',
      controller: 'podcastListController'
    })
    .state('podcastView', {
      url: '/podcast/:podcastId',
      templateUrl: 'features/podcast/podcastDetailView.html',
      controller: 'podcastDetailController'
    });

}]);
