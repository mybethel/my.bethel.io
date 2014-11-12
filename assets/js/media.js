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
    })
    .state('media.upload', {
      url: '/upload',
      templateUrl: 'templates/media/upload.html',
      controller: 'MediaUploadCtrl'
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

  io.socket.on('media', function (msg) { $scope.init(); });

  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.uploadFile($files[i]);
    }
  };

  $scope.uploadFile = function (file) {

    var ext = file.name.split('.').pop(),
        name = file.name.replace('.' + ext, '');

    io.socket.post('/media', {
      filename: name,
      extension: ext,
      ministry: $rootScope.ministry.id,
      _csrf: $rootScope._csrf
    }, function (data) {
      var mediaId = data.id;
      $upload.upload({
        url: $scope.upload.action,
        method: 'POST',
        data: {
          key: $scope.upload.bucket + '/' + data.id + '/original.' + ext,
          AWSAccessKeyId: $scope.upload.key, 
          acl: 'public-read',
          policy: $scope.upload.policy,
          signature: $scope.upload.signature,
        },
        file: file,
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        console.log('success!');
      });
    });

  };
});