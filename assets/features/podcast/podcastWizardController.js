angular.module('Bethel.podcast')
.controller('podcastWizardController', ['$scope', '$mdDialog', '$sailsBind', '$socket', '$timeout', 'upload', 'WizardHandler',
  function ($scope, $mdDialog, $sailsBind, $socket, $timeout, upload, WizardHandler) {

  $scope.newPodcast = {};
  $sailsBind.bind('service', $scope, { 'ministry': $scope.$root.ministry.id });

  // Focus on the "Name Your Podcast" field when the modal opens.
  $timeout(function() {
    document.querySelector('input.focus').focus();
  });

  $scope.selectType = function(type) {
    $scope.newPodcast.type = type;
    WizardHandler.wizard().next();
  };

  $scope.selectSource = function(source) {
    $scope.newPodcast.source = source;

    // If the user selects Bethel Cloud, the wizard will continue automatically.
    // Vimeo Pro sync requires additional information from the user.
    if (source !== 2)
      WizardHandler.wizard().next();
  };

  $scope.$watch('newPodcast.service', function (newValue, oldValue) {
    if (!newValue || newValue === oldValue)
      return;

    // If the user is connecting a new Vimeo account, this happens in a new tab
    // so that their current progress in the wizard is not lost.
    if (newValue === 'SERVICES_NEW') {
      window.open('/service/vimeo', '_blank'); 
      delete $scope.newPodcast.service;
    }
  });

  $scope.uploadThumbnail = function ($files) {
    $scope.thumbnailUploading = true;
    $socket.get('/podcast/new').then(function (response) {

      upload.s3(response, $files[0])
        .success(function() {
          $scope.newPodcast.temporaryImage = $files[0].name;
          $scope.thumbnailUploading = false;
        });

    });
  };

  $scope.createPodcast = function() {
    $scope.newPodcast._csrf = $scope.$root._csrf;
    $scope.newPodcast.ministry = $scope.$root.ministry;

    $socket.post('/podcast', $scope.newPodcast).then($mdDialog.hide);
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
