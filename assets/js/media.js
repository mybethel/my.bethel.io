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
      console.log($scope.upload);
    });

  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.uploadFile($files[i]);
    }
  };

  $scope.uploadFile = function (file) {
    $upload.upload({
      url: $scope.upload.action,
      method: 'POST',
      data: {
        key: $scope.upload.bucket + '/' + file.name,
        AWSAccessKeyId: $scope.upload.key, 
        acl: 'public-read',
        policy: $scope.upload.policy,
        signature: $scope.upload.signature,
      },
      file: file,
    }).progress(function(evt) {
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    }).success(function(data, status, headers, config) {
      // file is uploaded successfully
      console.log(data);
    });
  }
});