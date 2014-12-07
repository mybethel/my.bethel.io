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
    .state('media.collection', {
      url: '/:collectionId',
      templateUrl: 'templates/media/collection.html',
      controller: 'MediaCollectionCtrl'
    })
    .state('media.collection.edit', {
      url: '/edit',
      templateUrl: 'templates/media/collection.edit.html',
      controller: 'MediaCollectionEditCtrl'
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
  return function(media, width, height) {
    if (typeof media === 'undefined' || typeof media.ministry === 'undefined') return '';

    var ministry = (typeof media.ministry.id === 'undefined') ? media.ministry : media.ministry.id,
        prefix = 'https://images.bethel.io/',
        postfix = '?crop=faces&fit=crop&w=' + width + '&h=' + height;

    if (media.status === 'STATUS_UPLOADING') return prefix + 'images/DefaultPodcaster.png' + postfix;

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

      case 'collection':
        if (media.poster_frame == 'custom') {
          thumbnail = prefix + media.poster_frame_custom;
        }
        else {
          thumbnail = prefix + 'images/DefaultPodcaster.png';
        }
        break;

      default:
        thumbnail = prefix + 'images/DefaultPodcaster.png';

    }

    thumbnail += postfix;

    return thumbnail;
  };
})

.controller('MediaListCtrl', function ($scope, $rootScope, $state, $stateParams, $upload) {

  // Show the "All Media" collection by default.
  if ($state.is('media')) {
    $state.go('.collection', { collectionId: 'all'});
  }

  $scope.init = function() {
    io.socket.get('/media/browser/' + $scope.filterByCollection, function (data) {
      $scope.$apply(function() {
        $scope.collections = data.collections;
        $scope.upload = data.upload;
      });
    });
  };

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

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
      $state.go('media.collection.edit', { collectionId: data.id });
    });
  };
})

.controller('MediaCollectionCtrl', function ($scope, $rootScope, $state, $stateParams, $upload) {

  $scope.showVideo = $scope.showAudio = $scope.showImage = true;
  $scope.filterByCollection = $stateParams.collectionId || 'all';
  $scope.$parent.selectedCollection = $scope.filterByCollection;

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

  $scope.showCollection = function(collection) {
    if (!$state.is('media')) {
      $state.go('media', { collectionId: 'me'});
    }
  };

  $scope.init = function() {
    $scope.$parent.init();
    io.socket.get('/media/browser/' + $scope.filterByCollection, function (data) {
      $scope.media = data.media;
      $scope.upload = data.upload;
      $scope.selectedCollection = data.selectedCollection;
      $scope.$apply();
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

})

.controller('MediaCollectionEditCtrl', function ($scope, $rootScope, $state, $stateParams, $upload, $sce) {
  $scope.init = function() {
    io.socket.get('/media/' + $stateParams.collectionId, function (data) {
      $scope.collection = data;
      $scope.collection.description = $sce.trustAsHtml(data.description);
      $scope.$apply();

      new MediumEditor('.collection-title', { disableToolbar: true, disableReturn: true });
      new MediumEditor('.collection-description');
    });
  };

  $('.collection-title').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.collection.id, {
      name: $('.collection-title').text(),
      _csrf: $rootScope._csrf
    }, function () {
      // Trigger a refresh since socket doesn't emit to the same browser that broadcasts.
      $scope.$parent.init();
    });
  }));

  $('.collection-description').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.collection.id, {
      description: $('.collection-description').html(),
      _csrf: $rootScope._csrf
    });
  }));

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  // Triggered when a file is chosen for upload.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      var ext = $files[i].name.split('.').pop(),
          location = 'media/' + $scope.collection.ministry.id + '/' + $scope.collection.id + '/' + $files[i].name;

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
      $scope.collection.poster_frame = 'custom';
      $scope.collection.poster_frame_custom = location;
      io.socket.put('/media/' + $scope.collection.id, {
        poster_frame: 'custom',
        poster_frame_custom: location,
        _csrf: $rootScope._csrf
      });
    });
  };
})

.controller('MediaViewCtrl', function ($scope, $rootScope, $stateParams, $sce, $upload, $http) {
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
