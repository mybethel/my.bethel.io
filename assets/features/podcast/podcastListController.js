angular.module('Bethel.podcast')
.controller('podcastListController', ['$scope', '$state', '$mdDialog', 'sailsSocket', '$location',
  function ($scope, $state, $mdDialog, sailsSocket, $location) {

  var $ctrl = this;
  $scope.historicalStats = {};
  $scope.podcasts = [];
  $scope.statistics = {};

  $scope.init = function() {
    if (!$scope.$root.ministry) return;
    $scope.podcasts = sailsSocket.populateMany('podcast', { 'ministry': $scope.$root.ministry.id });
  };

  // Bind the podcast list over socket.io for this ministry.
  $scope.$root.$watch('ministry', function (newValue) {
    if (!newValue || !newValue.id) return;
    $scope.init();
  });

  $scope.view = function(podcast) {
    $state.go('podcastView', { podcastId: podcast });
  };

  $ctrl.getSubscriberCount = function(podcast) {
    sailsSocket.get('/podcast/subscribers/' + podcast.id).then(function(response) {
      $scope.statistics[response.podcast] = response.subscribers;
      $scope.historicalStats[response.podcast] = response.historical;
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watchCollection('podcasts', function(newValue) {
    angular.forEach(newValue, $ctrl.getSubscriberCount);
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
