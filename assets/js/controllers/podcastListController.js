angular.module('Bethel.podcast')

.controller('PodcastListController', function ($rootScope, $scope, $sailsBind, $location, WizardHandler) {

  $scope.createWizard = false;
  $scope.newPodcast = {};
  $scope.statistics = {};

  // Bind the podcast list over socket.io for this ministry.
  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $sailsBind.bind('podcast', $scope, { 'ministry': $rootScope.ministry.id });
    $sailsBind.bind('service', $scope, { 'ministry': $rootScope.ministry.id });
  });

  var getSubscriberCount = function(podcast) {
    io.socket.get('/podcast/subscribers/' + podcast.id, function (response) {
      $scope.$apply(function() {
        $scope.statistics[podcast.id] = 0;
      });
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watchCollection('podcasts', function() {
    if (typeof $scope.podcasts === 'undefined')
      return;

    $scope.podcasts.forEach(getSubscriberCount);
  });

  $scope.cancelWizard = function() {
    $scope.newPodcast = {};
    $scope.createWizard = false;
  };

  $scope.showWizard = function() {
    $scope.createWizard = true;
  };

  $scope.selectType = function(type) {
    $scope.newPodcast.type = type;
    WizardHandler.wizard().next();
  };

  $scope.selectSource = function(source) {
    $scope.newPodcast.source = source;

    if (source !== 2)
      WizardHandler.wizard().next();
  };

  $scope.selectAccount = function(account) {
    $scope.newPodcast.service = account;
  };

  $scope.createPodcast = function() {
    $scope.newPodcast._csrf = $rootScope._csrf;
    $scope.newPodcast.ministry = $rootScope.ministry;

    io.socket.post('/podcast', $scope.newPodcast, function (response) {
      $scope.$apply(function() {
        $scope.cancelWizard();
        $location.path('/podcast/' + response.id).replace();
      });
    });
  };

});
