angular.module('Bethel.podcast')
.controller('podcastWizardController', ['$scope', '$mdDialog', '$socket', '$timeout', '$upload', 'WizardHandler',
  function ($scope, $mdDialog, $socket, $timeout, $upload, WizardHandler) {

  $scope.newPodcast = {};

  $timeout(function() {
    document.querySelector('input.focus').focus();
  });

  $scope.selectType = function(type) {
    $scope.newPodcast.type = type;
    WizardHandler.wizard().next();
  };

  $scope.selectSource = function(source) {
    $scope.newPodcast.source = source;

    if (source !== 2)
      WizardHandler.wizard().next();
  };

  $scope.selectAccount = function(account) {
    $scope.newPodcast.service = account;
  };

  $scope.uploadThumbnail = function ($files) {
    $scope.thumbnailUploading = true;
    $socket.get('/podcast/new').then(function (response) {
      var fileMeta = {
        key: response.bucket + '/' + $files[0].name,
        AWSAccessKeyId: response.key, 
        acl: 'public-read',
        policy: response.policy,
        signature: response.signature,
        'Content-Type': $files[0].type !== '' ? $files[0].type : 'application/octet-stream'
      };
      $upload.upload({
        url: response.action,
        method: 'POST',
        data: fileMeta,
        file: $files[0],
      })
      .success(function (data, status, headers, config) {
        $scope.newPodcast.temporaryImage = $files[0].name;
        $scope.thumbnailUploading = false;
      });
    });
  };

  $scope.createPodcast = function() {
    $scope.newPodcast._csrf = $scope.$root._csrf;
    $scope.newPodcast.ministry = $scope.$root.ministry;

    io.socket.post('/podcast', $scope.newPodcast, function (newPodcast) {
      $mdDialog.hide(newPodcast);
    });
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
