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
    .state('media.view', {
      url: '/:mediaId',
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

.controller('MediaListCtrl', function ($scope, $rootScope, $upload) {

  $scope.showVideo = $scope.showAudio = $scope.showImage = true;

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
    io.socket.get('/media/browser', function (data) {
      $scope.media = data.media;
      $scope.upload = data.upload;
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

  $scope.typeForMediaWithIndex = function(i) {
    switch ($scope.media[i].type) {
      case 'image':
        thumbnail = '/render/320x180/media/' + $scope.media[i].ministry + '/' + $scope.media[i].id + '/original.' + $scope.media[i].extension;
        break;

      default:
        thumbnail = '/render/320x180/images/DefaultPodcaster.png';

    }

    return thumbnail;
  };

  $scope.$watch('media', function() {
    if (typeof $scope.media === 'undefined')
      return;

    for (var i = 0; i < $scope.media.length; i++) {

      // If the file hasn't finished uploading, render a generic thumbnail.
      if ($scope.media[i].status == 'STATUS_UPLOADING') {
        $scope.media[i].thumbnail = '/render/320x180/images/DefaultPodcaster.png';
        continue;
      }

      $scope.media[i].thumbnail = $scope.typeForMediaWithIndex(i);
    }
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
        $scope.media[i].thumbnail = $scope.typeForMediaWithIndex(i);
        $scope.$apply();
      });
    });
  };

})

.controller('MediaViewCtrl', function ($scope, $rootScope, $stateParams, $sce) {
  $scope.id = $stateParams.mediaId;

  io.socket.get('/media/' + $scope.id, function (data) {
    $scope.media = data;
    $scope.media.description = $sce.trustAsHtml(data.description);
    if (typeof $scope.media.tags !== 'undefined') {
      $scope.media.tags.forEach(function (tag) {
        $scope.tags.push({ text: tag });
      });
    }
    $scope.$apply();

    new MediumEditor('.media-description');
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
    console.log($scope.media.tags);
  };

  $('.media-description').on('input', function() {
    io.socket.put('/media/' + $scope.media.id, {
      description: $('.media-description').html(),
      _csrf: $rootScope._csrf
    });
  });

  $scope.thumbnailForMediaWithSize = function(media, size) {
    if (typeof media === 'undefined')
      return;

    switch (media.type) {
      case 'image':
        thumbnail = '/render/' + size + '/media/' + media.ministry.id + '/' + media.id + '/original.' + media.extension;
        break;

      default:
        thumbnail = '/render/' + size + '/images/DefaultPodcaster.png';

    }

    return thumbnail;
  };
});
