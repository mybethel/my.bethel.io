angular.module('Bethel.podcast', ['ngSailsBind'])

.config(function ($stateProvider, $translatePartialLoaderProvider) {

  $translatePartialLoaderProvider.addPart('podcast');

  $stateProvider
    .state('podcast', {
      url: '/podcast',
      templateUrl: 'templates/podcast/index.html',
      controller: 'PodcastListController'
    })
    .state('podcast.view', {
      url: '/:podcastId',
      templateUrl: 'templates/podcast/view.html',
      controller: 'PodcastViewController'
    });

});
