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

.controller('MediaListCtrl', function ($scope, sailsSocket, $log, filterFilter) {

})

.controller('MediaUploadCtrl', function ($scope, sailsSocket, $log, $upload, $http, filterFilter) {

  $http.get('/media/browser')
    .success(function (data, status, headers, config) {
      $scope.upload = data.upload;
    });

  $http.get('/csrfToken')
    .success(function (data, status) {
      $scope._csrf = data._csrf;
    });

  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.uploadFile($files[i]);
    }
  };

  $scope.uploadFile = function (file) {

    var ext = file.name.split('.').pop(),
        name = file.name.replace('.' + ext, '');

    $http.post('/media', {
      filename: name,
      extension: ext,
      _csrf: $scope._csrf
    }).success(function (data, status) {
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