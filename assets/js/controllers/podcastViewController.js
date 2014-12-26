angular.module('Bethel.podcast')

.controller('PodcastViewController', function ($rootScope, $scope, $state, $stateParams, $upload) {

  var titleEditor;
  $scope.id = $stateParams.podcastId;
  $scope.uploadProgress = 0;
  $scope.editing = false;

  io.socket.get('/podcast/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.podcast = data;
    });
    new MediumEditor('.editable.description', { disableToolbar: true });

    // On initial page load, the title is not editable.
    titleEditor = new MediumEditor('.title', { disableToolbar: true, disableReturn: true });
    titleEditor.deactivate();
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

  $scope.toggleEditing = function() {
    $scope.editing = !$scope.editing;
  };

  $scope.$watch('editing', function() {
    if (typeof titleEditor === 'undefined')
      return;

    if ($scope.editing === true) {
      titleEditor.activate();
    } else {
      titleEditor.deactivate();
    }
  });

  $scope.$watch('podcast', function() {
    if (typeof $scope.podcast === 'undefined') return;

    if (typeof $scope.podcast.sourceMeta === 'string') {
      $scope.podcast.sourceMeta = $scope.podcast.sourceMeta.split(',');
    }
  });

  // Save action for podcast title.
  $('h1.title').on('input', $.debounce(250, function() {
    io.socket.put('/podcast/' + $scope.id, {
      name: $('h1.title').text(),
      _csrf: $rootScope._csrf
    });
  }));

  // Save action for podcast description.
  $('.editable.description').on('input', $.debounce(250, function() {
    io.socket.put('/podcast/' + $scope.id, {
      description: $('.editable.description').text(),
      _csrf: $rootScope._csrf
    });
  }));

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
