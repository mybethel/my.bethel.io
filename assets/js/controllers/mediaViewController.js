angular.module('Bethel.media')

.controller('MediaViewController', function ($scope, $rootScope, $stateParams, $sce, $upload, $http) {
  $scope.id = $stateParams.mediaId;
  $scope.thumbnailUploading = false;
  $scope.thumbnailCustomUrl = '';
  $scope.$parent.selectedCollection = '';

  io.socket.get('/media/' + $scope.id, function (data) {
    $scope.media = data;
    $scope.media.description = $sce.trustAsHtml(data.description);
    if (typeof $scope.media.tags !== 'undefined') {
      $scope.media.tags.forEach(function (tag) {
        if (tag.match(/^[0-9a-fA-F]{24}$/)) {
          io.socket.get('/media/' + tag, function (collection) {
            $scope.tags.push({ id: tag, text: collection.name });
            $scope.$apply();
          });
        } else {
          $scope.tags.push({ text: tag });
        }
      });
    }
    if (data.type === 'video') {
      $scope.media.preview = $sce.trustAsResourceUrl('https://cloud.bethel.io/media/' + data.ministry.id + '/' + data.id + '/preview.mp4');
    }
    $scope.$apply();

    new MediumEditor('.media-title', { disableToolbar: true, disableReturn: true });
    new MediumEditor('.media-description');
    if (data.type === 'video') $scope.player = videojs('media-player');
  });

  io.socket.get('/media/browser', function (data) {
    $scope.upload = data.upload;
    $scope.$apply();
  });

  $scope.$on('$destroy', function() {
    if ($scope.player) $scope.player.dispose();
  });

  $scope.loadTags = function(query) {
    return $http.get('/media/collections/' + query);
  };

  $scope.updateTags = function(tag, action) {
    switch (action) {
      case 'added':
        if (typeof $scope.media.tags === 'undefined') {
          $scope.media.tags = [];
        }
        if (typeof tag.id !== 'undefined') {
          $scope.media.tags.push(tag.id);
        } else {
          $scope.media.tags.push(tag.text);
        }
        break;

      case 'removed':
        var tagToDelete = (typeof tag.id !== 'undefined') ? $scope.media.tags.indexOf(tag.id) : $scope.media.tags.indexOf(tag.text);
        if (tagToDelete > -1) {
          $scope.media.tags.splice(tagToDelete, 1);
        }
        break;
    }

    io.socket.put('/media/' + $scope.media.id, {
      tags: $scope.media.tags,
      _csrf: $rootScope._csrf
    });
  };

  $('.media-title').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.media.id, {
      name: $('.media-title').text(),
      _csrf: $rootScope._csrf
    });
  }));

  $('.media-description').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.media.id, {
      description: $('.media-description').html(),
      _csrf: $rootScope._csrf
    });
  }));

  $scope.togglePublic = function() {
    $scope.media.public = !$scope.media.public;
    io.socket.put('/media/' + $scope.media.id, {
      public: $scope.media.public,
      _csrf: $rootScope._csrf
    });
  };

  $scope.setThumbnail = function(thumbnail) {
    $scope.media.posterFrame = thumbnail;
    io.socket.put('/media/' + $scope.media.id, {
      posterFrame: thumbnail,
      _csrf: $rootScope._csrf
    });
  };

  // Triggered when a file is chosen for upload.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.uploadFile('media/' + $scope.media.ministry.id + '/' + $scope.media.id + '/thumbnails/' + $files[i].name, $files[i]);
    }
  };

  $scope.uploadFile = function (location, file) {
    var fileMeta = {
      key: location,
      AWSAccessKeyId: $scope.upload.key, 
      acl: 'public-read',
      policy: $scope.upload.policy,
      signature: $scope.upload.signature,
    };

    $upload.upload({
      url: $scope.upload.action,
      method: 'POST',
      data: fileMeta,
      file: file,
    })
    .progress(function(evt) {
      $scope.thumbnailUploading = true;
    })
    .success(function(data, status, headers, config) {
      $scope.thumbnailUploading = false;
      $scope.media.posterFrame = 'custom';
      $scope.media.posterFrameCustom = location;
      io.socket.put('/media/' + $scope.media.id, {
        posterFrame: 'custom',
        posterFrameCustom: location,
        _csrf: $rootScope._csrf
      });
    });
  };
});
