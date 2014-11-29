angular.module('Bethel.media', [
  'ui.router',
  'angularFileUpload',
  'ngTagsInput',
  'angular-svg-round-progress'
])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('media', {
      url: '/media',
      templateUrl: 'templates/media/index.html',
      controller: 'MediaListCtrl'
    })
    .state('media-collection', {
      url: '/media/collection/:collectionId',
      templateUrl: 'templates/media/index.html',
      controller: 'MediaListCtrl'
    })
    .state('media.view', {
      url: '/view/:mediaId',
      templateUrl: 'templates/media/view.html',
      controller: 'MediaViewCtrl'
    });

})

.filter('duration', function() {
  return function(milliseconds) {
    milliseconds = Number(milliseconds);
    var seconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return minutes + ':' + seconds;
  };
})

.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  };
})

.filter('thumbnail', function() {
  return function(media, size) {
    if (typeof media === 'undefined' || typeof media.ministry === 'undefined') return '';

    var ministry = (typeof media.ministry.id === 'undefined') ? media.ministry : media.ministry.id,
        prefix = '/render/' + size + '/';

    if (media.status === 'STATUS_UPLOADING') return prefix + 'images/DefaultPodcaster.png';

    switch (media.type) {
      case 'image':
        thumbnail = prefix + 'media/' + ministry + '/' + media.id + '/original.' + media.extension;
        break;

      case 'video':
        if (media.poster_frame) {
          thumbnail = (media.poster_frame == 'custom') ? prefix + media.poster_frame_custom : prefix + 'media/' + ministry + '/' + media.id + '/thumbnails/frame_000' + (Number(media.poster_frame) - 1) + '.jpg';
        }
        else if (media.video_frames > 1) {
          thumbnail = prefix + 'media/' + ministry + '/' + media.id + '/thumbnails/frame_0001.jpg';
        }
        else {
          thumbnail = prefix + 'images/DefaultPodcaster.png';
        }
        break;

      default:
        thumbnail = prefix + 'images/DefaultPodcaster.png';

    }

    return thumbnail;
  };
})

.controller('MediaListCtrl', function ($scope, $rootScope, $state, $stateParams, $upload) {

  $scope.showVideo = $scope.showAudio = $scope.showImage = true;
  $scope.filterByCollection = $stateParams.collectionId || 'all';

  $scope.filterByType = function(type) {
    if (type == 'video')
      $scope.showVideo = !$scope.showVideo;

    if (type == 'audio')
      $scope.showAudio = !$scope.showAudio;

    if (type == 'image')
      $scope.showImage = !$scope.showImage;
  };

  $scope.mediaType = function(media) {
    if ($scope.showVideo && media.type == 'video')
      return true;

    if ($scope.showAudio && media.type == 'audio')
      return true;

    if ($scope.showImage && media.type == 'image')
      return true;

    return false;
  };

  $scope.init = function() {
    io.socket.get('/media/browser/' + $scope.filterByCollection, function (data) {
      $scope.media = data.media;
      $scope.collections = data.collections;
      $scope.selectedCollection = data.selectedCollection;
      $scope.upload = data.upload;
      $scope.$apply();

      var elements = document.querySelectorAll('.collection-label'),
      editor = new MediumEditor(elements, { disableToolbar: true, disableReturn: true });

      $('.collection-label').on('input', function() {
        io.socket.put('/media/' + $(this).data('collection-id'), {
          name: $(this).text(),
          _csrf: $rootScope._csrf
        });
      });
    });
  };

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  $scope.indexOfMediaWithId = function(id) {
    if ($scope.media.length < 1)
      return;

    for (var i = 0; i < $scope.media.length; i++) {
      if ($scope.media[i].id == id) {
        return i;
      }
    }
  };

  // Called when any media is uploaded, modified or deleted.
  // @todo: Update only the record in the message rather than the entire scope.
  io.socket.on('media', function (msg) { $scope.init(); });

  // Triggered when a file is chosen for upload.
  // On supported browsers, multiple files may be chosen.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.createMedia($files[i]);
    }
  };

  // For each file uploaded, a Media object is first created.
  // This ensures that each file is tracked before the file exists in S3.
  $scope.createMedia = function (file) {

    var ext = file.name.split('.').pop(),
        name = file.name.replace('.' + ext, ''),
        type = file.type.split('/').shift();

    io.socket.post('/media', {
      filename: name,
      type: type,
      extension: ext,
      ministry: $rootScope.ministry.id,
      status: 'STATUS_UPLOADING',
      _csrf: $rootScope._csrf
    }, function (data) {
      var location = $scope.upload.bucket + '/' + data.id + '/original.' + ext;
      $scope.uploadFile(data.id, location, file);
    });

  };

  // The file is stored by the ID from the Media object with the Ministry folder.
  // Each file has it's own directory to store the original, encoded versions and thumbnails.
  $scope.uploadFile = function (mediaId, location, file) {
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
      var progress = parseInt(100.0 * evt.loaded / evt.total);
      if (progress % 5 === 0) {
        var i = $scope.indexOfMediaWithId(mediaId);
        $scope.media[i].progress = progress;
      }
    })
    .success(function(data, status, headers, config) {
      // Call the endpoint to generate metadata.
      io.socket.get('/media/meta/' + mediaId);
      // Mark the media as finished uploading.
      io.socket.put('/media/' + mediaId, {
        status: 'STATUS_FINISHED',
        _csrf: $rootScope._csrf
      }, function() {
        var i = $scope.indexOfMediaWithId(mediaId);
        $scope.media[i].status = 'STATUS_FINISHED';
        $scope.$apply();
      });
    });
  };

  $scope.createFolder = function() {
    io.socket.post('/media', {
      name: 'New Collection',
      type: 'collection',
      ministry: $rootScope.ministry.id,
      _csrf: $rootScope._csrf
    }, function(data) {
      $state.go('media-collection', { collectionId: data.id });
    });
  };

})

.controller('MediaViewCtrl', function ($scope, $rootScope, $stateParams, $sce, $upload) {
  $scope.id = $stateParams.mediaId;
  $scope.thumbnailUploading = false;
  $scope.thumbnailCustomUrl = '';

  io.socket.get('/media/' + $scope.id, function (data) {
    $scope.media = data;
    $scope.media.description = $sce.trustAsHtml(data.description);
    if (typeof $scope.media.tags !== 'undefined') {
      $scope.media.tags.forEach(function (tag) {
        $scope.tags.push({ text: tag });
      });
    }
    if (data.type == 'video') {
      $scope.media.preview = $sce.trustAsResourceUrl('https://cloud.bethel.io/media/' + data.ministry.id + '/' + data.id + '/preview.mp4');
    }
    $scope.$apply();

    new MediumEditor('.media-title', { disableToolbar: true, disableReturn: true });
    new MediumEditor('.media-description');
    if (data.type == 'video') $scope.player = videojs('media-player');
  });

  io.socket.get('/media/browser', function (data) {
    $scope.upload = data.upload;
    $scope.$apply();
  });

  $scope.$on('$destroy', function() {
    if ($scope.player) $scope.player.dispose();
  });

  $scope.updateTags = function(tag, action) {
    switch (action) {
      case 'added':
        if (typeof $scope.media.tags === 'undefined') {
          $scope.media.tags = [];
        }
        $scope.media.tags.push(tag.text);
        break;

      case 'removed':
        var tagToDelete = $scope.media.tags.indexOf(tag.text);
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

  $('.media-title').on('input', function() {
    io.socket.put('/media/' + $scope.media.id, {
      name: $('.media-title').text(),
      _csrf: $rootScope._csrf
    });
  });

  $('.media-description').on('input', function() {
    io.socket.put('/media/' + $scope.media.id, {
      description: $('.media-description').html(),
      _csrf: $rootScope._csrf
    });
  });

  $scope.setThumbnail = function(thumbnail) {
    $scope.media.poster_frame = thumbnail;
    io.socket.put('/media/' + $scope.media.id, {
      poster_frame: thumbnail,
      _csrf: $rootScope._csrf
    });
  };

  // Triggered when a file is chosen for upload.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      var ext = $files[i].name.split('.').pop(),
          location = 'media/' + $scope.media.ministry.id + '/' + $scope.media.id + '/thumbnails/' + $files[i].name;

      $scope.uploadFile(location, $files[i]);
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
      $scope.media.poster_frame = 'custom';
      $scope.media.poster_frame_custom = location;
      io.socket.put('/media/' + $scope.media.id, {
        poster_frame: 'custom',
        poster_frame_custom: location,
        _csrf: $rootScope._csrf
      });
    });
  };

});
