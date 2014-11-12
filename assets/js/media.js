angular.module('Bethel.media', [
  'ui.router',
  'angularFileUpload'
])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('media', {
      url: '/media',
      templateUrl: 'templates/media/index.html',
      controller: 'MediaListCtrl'
    });

})

.controller('MediaListCtrl', function ($scope, $rootScope, $upload) {

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
        name = file.name.replace('.' + ext, '');

    io.socket.post('/media', {
      filename: name,
      extension: ext,
      ministry: $rootScope.ministry.id,
      _csrf: $rootScope._csrf
    }, function (data) {
      $scope.uploadFile(data.id, file);
    });

  };

  // The file is stored by the ID from the Media object with the Ministry folder.
  // Each file has it's own directory to store the original, encoded versions and thumbnails.
  $scope.uploadFile = function (mediaId, file) {
    var fileMeta = {
      key: $scope.upload.bucket + '/' + mediaId + '/original.' + ext,
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
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    })
    .success(function(data, status, headers, config) {
      console.log('success!');
    });
  };

});