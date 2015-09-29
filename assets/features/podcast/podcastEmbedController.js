angular.module('Bethel.podcast')
.controller('podcastEmbedController', ['$scope', '$mdDialog', 'mediaId', '$sce', 'sailsSocket',
  function ($scope, $mdDialog, mediaId, $sce, sailsSocket) {

  $scope.mediaId = mediaId;
  $scope.mediaUrl = $sce.trustAsResourceUrl('/podcast/embed/episode/' + mediaId);

  $scope.save = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
