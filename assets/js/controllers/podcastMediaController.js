angular.module('Bethel.podcast')

.controller('PodcastMediaController', function ($scope, $modalInstance, mediaId, $sce) {

  io.socket.get('/podcastmedia/' + mediaId, function (data) {
    $scope.$apply(function() {
      $scope.media = data;
      $scope.media.url = $sce.trustAsResourceUrl(data.url);
      $scope.player = videojs('media-player', {
        controls: true,
        controlBar: {
          fullscreenToggle: false
        },
        autoplay: false,
        loop: false,
        width: '100%',
        height: 50,
      });
    });
  });

  $scope.save = function() {
    console.log($scope.media);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

});
