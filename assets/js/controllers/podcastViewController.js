angular.module('Bethel.podcast')

.controller('PodcastViewController', function ($rootScope, $scope, $state, $stateParams, $upload, $modal) {

  var titleEditor;
  $scope.id = $stateParams.podcastId;
  $scope.uploadProgress = 0;
  $scope.editing = false;

  io.socket.get('/podcast/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.podcast = data;
      $scope.tags = [];
      if (typeof data.tags !== 'undefined' && typeof data.tags !== 'string') {
        data.tags.forEach(function (tag) {
          $scope.tags.push({ text: tag });
        });
      }
      $scope.sourceMeta = [];
      if (typeof data.sourceMeta !== 'undefined' && typeof data.sourceMeta !== 'string') {
        data.sourceMeta.forEach(function (tag) {
          $scope.sourceMeta.push({ text: tag });
        });
      }
    });
    new MediumEditor('.editable.description', { disableToolbar: true });

    // On initial page load, the title is not editable.
    titleEditor = new MediumEditor('.title', { disableToolbar: true, disableReturn: true });
    titleEditor.deactivate();
  });

  io.socket.get('/podcast/edit/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.uploadEpisode = data.uploadEpisode;
    });
  });

  io.socket.get('/service/list', {}, function (response, status) {
    $scope.$apply(function() { $scope.accounts = response; });
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
    if (typeof $scope.podcast === 'undefined' || typeof $scope.podcasts === 'undefined')
      return;

    var i = findIndexByPropertyValue($scope.podcasts, 'id', $scope.id);
    $scope.podcasts[i] = $scope.podcast;
  }, true);

  // Save action for podcast title.
  $('h1.title').on('input', $.debounce(250, function() {
    $scope.podcast.name = $('h1.title').text();
    io.socket.put('/podcast/' + $scope.id, {
      name: $scope.podcast.name,
      _csrf: $rootScope._csrf
    });
  }));

  // Save action for podcast description.
  $('.editable.description').on('input', $.debounce(250, function() {
    $scope.podcast.description = $('.editable.description').text();
    io.socket.put('/podcast/' + $scope.id, {
      description: $scope.podcast.description,
      _csrf: $rootScope._csrf
    });
  }));

  $scope.setSource = function(source) {
    if (typeof source.id === 'undefined')
      return;

    io.socket.put('/podcast/' + $scope.id, {
      service: source.id,
      _csrf: $rootScope._csrf
    }, function (updated) {
      $scope.$apply(function () {
        $scope.podcast.service = updated.service;
      });
    });
  };

  $scope.updateTags = function(tag, action) {
    switch (action) {
      case 'added':
        if (typeof $scope.podcast.tags === 'undefined' || typeof $scope.podcast.tags === 'string') {
          $scope.podcast.tags = [];
        }
        $scope.podcast.tags.push(tag.text);
        break;

      case 'removed':
        var tagToDelete = $scope.podcast.tags.indexOf(tag.text);
        if (tagToDelete > -1) {
          $scope.podcast.tags.splice(tagToDelete, 1);
        }
        break;
    }

    io.socket.put('/podcast/' + $scope.id, {
      tags: $scope.podcast.tags,
      _csrf: $rootScope._csrf
    });
  };

  $scope.updateSource = function(tag, action) {
    switch (action) {
      case 'added':
        if (typeof $scope.podcast.sourceMeta === 'undefined' || typeof $scope.podcast.sourceMeta === 'string') {
          $scope.podcast.sourceMeta = [];
        }
        $scope.podcast.sourceMeta.push(tag.text);
        break;

      case 'removed':
        var tagToDelete = $scope.podcast.sourceMeta.indexOf(tag.text);
        if (tagToDelete > -1) {
          $scope.podcast.sourceMeta.splice(tagToDelete, 1);
        }
        break;
    }

    io.socket.put('/podcast/' + $scope.id, {
      sourceMeta: $scope.podcast.sourceMeta,
      _csrf: $rootScope._csrf
    });
  };

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

  $scope.editMedia = function (id) {

    var modalInstance = $modal.open({
      templateUrl: 'templates/podcast/media.html',
      controller: 'PodcastMediaController',
      resolve: {
        mediaId: function() {
          return id;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

});
