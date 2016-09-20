angular.module('Bethel.podcast', [
  'Bethel.util',
  'chart.js',
  'mgo-angular-wizard'
]).config(PodcastConfig);

function PodcastConfig($stateProvider) {

  $stateProvider
    .state('podcast', {
      url: '/podcast',
      templateUrl: 'features/podcast/podcastListView.html',
      controller: 'podcastListController',
      data: { pageTitle: 'Podcasting' }
    })
    .state('podcastView', {
      url: '/podcast/:podcastId',
      templateUrl: 'features/podcast/podcastDetailView.html',
      controller: 'podcastDetailController',
      data: { pageTitle: 'Podcasting' }
    });

}

PodcastConfig.$inject = ['$stateProvider'];
