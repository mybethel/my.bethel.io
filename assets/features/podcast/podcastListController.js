angular.module('Bethel.podcast')
.controller('podcastListController', ['$scope', '$state', '$mdDialog', 'sailsSocket', '$location',
function($scope, $state, $mdDialog, sailsSocket, $location) {

  var $ctrl = this;
  $scope.historicalStats = {};
  $scope.podcasts = [];
  $scope.podcastMedia = [];
  $scope.statistics = {};

  $scope.init = function() {
    if (!$scope.$root.ministry) return;
    $scope.podcasts = sailsSocket.populateMany('podcast', { ministry: $scope.$root.ministry.id, deleted: { '!': true } });
  };

  // Bind the podcast list over socket.io for this ministry.
  $scope.$root.$watch('ministry', function(newValue) {
    if (!newValue || !newValue.id) return;
    $scope.init();
  });

  $scope.view = function(podcast) {
    $state.go('podcastView', { podcastId: podcast });
  };

  $ctrl.getPodcastMeta = function(podcast) {
    if (podcast.media) {
      podcast.media = podcast.media.filter(function(episode) {
        return episode.deleted !== true;
      });
    }
    sailsSocket.get('/_analytics/podcastSubscribers/' + podcast.id).then(function(response) {
      $scope.statistics[podcast.id] = response.subscribers;
      $scope.historicalStats[podcast.id] = response.historical;
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watchCollection('podcasts', function(newValue) {
    angular.forEach(newValue, $ctrl.getPodcastMeta);
  });

  $scope.showWizard = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      controller: 'podcastWizardController',
      focusOnOpen: false,
      templateUrl: 'features/podcast/podcastWizardView.html',
      targetEvent: event
    })
    .then(function(podcast) {
      $scope.podcasts.push(podcast);
      $location.path('/podcast/' + podcast.id).replace();
    });
  };

}]);
