angular.module('Bethel.podcast')

.controller('PodcastMediaController', function ($scope, $rootScope, $modalInstance, mediaId, $sce, $http) {

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

  // Autocomplete for ministries using the Bethel web platform.
  $scope.getSeries = function(query) {
    if (typeof $rootScope.ministry.url === 'undefined')
      return;

    return $http.get($rootScope.ministry.url + '/bethel/podcaster/autocomplete/' + query)
      .then(function (response){
        return response.data.results;
      });
  };

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
