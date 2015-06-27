angular.module('Bethel.podcast')
.controller('podcastListController', ['$scope', '$state', '$mdDialog', 'sailsSocket', '$location',
  function ($scope, $state, $mdDialog, sailsSocket, $location) {

  $scope.statistics = {};
  $scope.historicalStats = {};

  // Bind the podcast list over socket.io for this ministry.
  $scope.$root.$watch('ministry', function (newValue) {
    if (!newValue || !newValue.id) return;
    $scope.podcasts = sailsSocket.populateList('podcast', { 'ministry': newValue.id });
  });

  $scope.view = function(podcast) {
    $state.go('.view', { podcastId: podcast });
  };

  var getSubscriberCount = function(podcast) {
    sailsSocket.get('/podcast/subscribers/' + podcast.id).then(function (response) {
      if (!angular.isDefined(response.subscribers))
        return;

      $scope.statistics[podcast.id] = response.subscribers;
      $scope.historicalStats[podcast.id] = response.historical;
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watchCollection('podcasts', function() {
    if (angular.isUndefined($scope.podcasts))
      return;

    $scope.podcasts.forEach(getSubscriberCount);
  });

  $scope.showWizard = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      controller: 'podcastWizardController',
      focusOnOpen: false,
      templateUrl: 'features/podcast/podcastWizardView.html',
      targetEvent: event,
    })
    .then(function (podcast) {
      $scope.podcasts.push(podcast);
      $location.path('/podcast/' + podcast.id).replace();
    });
  };

}]);
