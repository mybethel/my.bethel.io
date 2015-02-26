angular.module('Bethel.media')

.controller('MediaListController', function ($scope, $rootScope, $state, $upload) {

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
      'Content-Type': file.type !== '' ? file.type : 'application/octet-stream'
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
});
