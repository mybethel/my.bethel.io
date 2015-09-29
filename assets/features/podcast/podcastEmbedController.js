angular.module('Bethel.podcast')
.controller('podcastEmbedController', ['$scope', 'embedSettings', '$mdDialog', 'mediaId', 'podcastId', '$sce', 'sailsSocket',
  function ($scope, embedSettings, $mdDialog, mediaId, podcastId, $sce, sailsSocket) {

  $scope.embedSettings = embedSettings || {
    textColor: '#FFF',
    controlColor: '#FFF',
    sliderColor: '#FFF'
  };

  $scope.mediaUrl = $sce.trustAsResourceUrl('/podcast/embed/episode/' + mediaId);

  $scope.$watch('embedSettings', function(newValue, oldValue) {
    if (!newValue || newValue == oldValue) return;
    sailsSocket.put('/podcast/' + podcastId, { embedSettings: $scope.embedSettings }).then($scope.refreshPreview);
  }, true);

  $scope.refreshPreview = function() {
    document.getElementById('embed-preview').contentWindow.location.reload();
  };

  $scope.done = function() {
    $mdDialog.cancel();
  };

}]);
