angular.module('Bethel.podcast')

.controller('PodcastMediaController', function ($scope, $modalInstance, mediaId) {

  io.socket.get('/podcastmedia/' + mediaId, function (data) {
    $scope.$apply(function() {
      $scope.media = data;
    });
  });

  $scope.save = function() {
    console.log($scope.media);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

});
