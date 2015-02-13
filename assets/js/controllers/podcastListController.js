angular.module('Bethel.podcast')

.controller('PodcastListController', function ($rootScope, $scope, $sailsBind, $location, WizardHandler, $upload) {

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
      if (!angular.isDefined(response.subscribers))
        return;
      
      $scope.$apply(function() {
        $scope.statistics[podcast.id] = response.subscribers;
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

  $scope.uploadThumbnail = function ($files) {
    $scope.thumbnailUploading = true;
    io.socket.get('/podcast/new', function (response) {
      var fileMeta = {
        key: response.bucket + '/' + $files[0].name,
        AWSAccessKeyId: response.key, 
        acl: 'public-read',
        policy: response.policy,
        signature: response.signature,
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
    $scope.newPodcast._csrf = $rootScope._csrf;
    $scope.newPodcast.ministry = $rootScope.ministry;

    io.socket.post('/podcast', $scope.newPodcast, function (podcastObject) {
      $scope.$apply(function() {
        $scope.podcasts.push(podcastObject);
        $scope.cancelWizard();
        $location.path('/podcast/' + podcastObject.id).replace();
      });
    });
  };

});
