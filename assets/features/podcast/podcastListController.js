angular.module('Bethel.podcast')

.controller('podcastListController', ['$scope', '$state', '$mdDialog', '$sailsBind', '$location', 'WizardHandler', '$upload', function ($scope, $state, $mdDialog, $sailsBind, $location, WizardHandler, $upload) {

  $scope.createWizard = false;
  $scope.newPodcast = {};
  $scope.statistics = {};
  $scope.historicalStats = {};

  // Bind the podcast list over socket.io for this ministry.
  $scope.$root.$watch('ministry', function() {
    if (!$scope.$root.ministry || !$scope.$root.ministry.id)
      return;

    $sailsBind.bind('podcast', $scope, { 'ministry': $scope.$root.ministry.id });
    $sailsBind.bind('service', $scope, { 'ministry': $scope.$root.ministry.id });
  });

  $scope.view = function(podcast) {
    $state.go('.view', { podcastId: podcast });
  };

  var getSubscriberCount = function(podcast) {
    io.socket.get('/podcast/subscribers/' + podcast.id, function (response) {
      if (!angular.isDefined(response.subscribers))
        return;
      
      $scope.$apply(function() {
        $scope.statistics[podcast.id] = response.subscribers;
        $scope.historicalStats[podcast.id] = response.historical;
      });
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
      templateUrl: 'features/podcast/podcastWizardView.html',
      targetEvent: event,
    })
    .then(function (answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
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

  $scope.uploadThumbnail = function ($files) {
    $scope.thumbnailUploading = true;
    io.socket.get('/podcast/new', function (response) {
      var fileMeta = {
        key: response.bucket + '/' + $files[0].name,
        AWSAccessKeyId: response.key, 
        acl: 'public-read',
        policy: response.policy,
        signature: response.signature,
        'Content-Type': $files[0].type !== '' ? $files[0].type : 'application/octet-stream'
      };
      $upload.upload({
        url: response.action,
        method: 'POST',
        data: fileMeta,
        file: $files[0],
      })
      .success(function (data, status, headers, config) {
        $scope.newPodcast.temporaryImage = $files[0].name;
        $scope.thumbnailUploading = false;
      });
    });
  };

  $scope.createPodcast = function() {
    $scope.newPodcast._csrf = $scope.$root._csrf;
    $scope.newPodcast.ministry = $scope.$root.ministry;

    io.socket.post('/podcast', $scope.newPodcast, function (podcastObject) {
      $scope.$apply(function() {
        $scope.podcasts.push(podcastObject);
        $scope.cancelWizard();
        $location.path('/podcast/' + podcastObject.id).replace();
      });
    });
  };

}]);
