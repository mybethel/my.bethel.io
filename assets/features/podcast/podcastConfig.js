angular.module('Bethel.podcast', ['Bethel.util', 'chart.js', 'mgo-angular-wizard'])

.config(['$stateProvider', '$translatePartialLoaderProvider', function ($stateProvider, $translatePartialLoaderProvider) {

  $translatePartialLoaderProvider.addPart('podcast');

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
