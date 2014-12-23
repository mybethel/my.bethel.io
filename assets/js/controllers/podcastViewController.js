angular.module('Bethel.podcast')

.controller('PodcastViewController', function ($rootScope, $scope, $state, $stateParams, $upload) {

  $scope.id = $stateParams.podcastId;
  $scope.uploadProgress = 0;

  io.socket.get('/podcast/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.podcast = data;
    });
    new MediumEditor('.editable.title', { disableToolbar: true, disableReturn: true });
    new MediumEditor('.editable.description', { disableToolbar: true });
  });

  io.socket.get('/podcast/subscribers/' + $scope.id, function (response) {
    if (typeof response.subscribers !== 'undefined')
      $scope.subscribers = response.subscribers;
  });

  io.socket.get('/podcast/edit/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.uploadEpisode = data.uploadEpisode;
    });
  });

  $scope.setType = function (type) {
    $scope.podcast.type = (type === 'audio') ? 1 : 2;
    io.socket.put('/podcast/' + $scope.podcast.id, {
      type: $scope.podcast.type,
      _csrf: $rootScope._csrf
    });
  };

  $scope.$watch('podcast', function() {
    if (typeof $scope.podcast === 'undefined') return;

    if (typeof $scope.podcast.sourceMeta === 'string') {
      $scope.podcast.sourceMeta = $scope.podcast.sourceMeta.split(',');
    }
  });

  // Triggered when a file is chosen for upload.
  // On supported browsers, multiple files may be chosen.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.createPodcastMedia($files[i]);
    }
  };

  $scope.createPodcastMedia = function (file) {

    var fileMeta = {
      key: $scope.uploadEpisode.bucket + '/' + file.name,
      AWSAccessKeyId: $scope.uploadEpisode.key,
      acl: 'public-read',
      policy: $scope.uploadEpisode.policy,
      signature: $scope.uploadEpisode.signature,
    };

    $upload.upload({
      url: $scope.uploadEpisode.action,
      method: 'POST',
      data: fileMeta,
      file: file,
    })
    .progress(function(evt) {
      $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
    })
    .success(function(data, status, headers, config) {
      io.socket.get('/podcastmedia/refresh', function() {
        $state.go($state.$current, null, { reload: true });
      });
    });
  };

});
