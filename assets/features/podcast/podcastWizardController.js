angular.module('Bethel.podcast')
.controller('podcastWizardController', ['$mdDialog', '$scope', '$socket', '$timeout', 'upload', 'WizardHandler',
  function ($mdDialog, $scope, $socket, $timeout, upload, WizardHandler) {

  $scope.newPodcast = {};

  $scope.$root.$watch('ministry', function (newValue) {
    if (!newValue) return;
    $scope.services = [];
    $scope.services = $socket.populateList('service', { 'ministry': newValue.id });
  });

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
    if (!newValue) return;

    // If the user is connecting a new Vimeo account, this happens in a new tab
    // so that their current progress in the wizard is not lost.
    if (newValue === 'SERVICES_NEW') {
      window.open('/service/vimeo', '_blank'); 
      delete $scope.newPodcast.service;
    }
  });

  $scope.selectThumbnail = function($files) {
    $scope.thumbnail = $files[0];
    $scope.thumbnailUploading = true;
    $socket.get('/podcast/new').then($scope.uploadThumbnail);
  };

  $scope.uploadThumbnail = function(response) {
    upload.s3(response, $scope.thumbnail).success($scope.applyThumbnail);
  };

  $scope.applyThumbnail = function() {
    $scope.newPodcast.temporaryImage = $scope.thumbnail.name;
    $scope.thumbnailUploading = false;
  };

  $scope.createPodcast = function() {
    $scope.newPodcast.ministry = $scope.$root.ministry;
    $socket.post('/podcast', $scope.newPodcast).then($mdDialog.hide);
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
