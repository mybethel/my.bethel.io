angular.module('Bethel.podcast')

.controller('PodcastMediaController', function ($scope, $rootScope, $modalInstance, mediaId, $sce) {

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
        height: 70,
      });
    });
  });

  $scope.save = function() {
    io.socket.put('/podcastmedia/' + mediaId, {
      name: $scope.media.name,
      date: $scope.media.date,
      description: $scope.media.description,
      reference: $scope.media.reference,
      _csrf: $rootScope._csrf
    }, function() {
      $modalInstance.dismiss($scope.media);
    });
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.$on('$destroy', function() {
    if ($scope.player) $scope.player.dispose();
  });

});
