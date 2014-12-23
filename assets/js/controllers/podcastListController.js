angular.module('Bethel.podcast')

.controller('PodcastListController', function ($rootScope, $scope) {

  $scope.podcasts = [];
  $scope.statistics = [];

  $scope.init = function() {
    io.socket.get('/podcast/list', function (response) {
      $scope.$apply(function() {
        $scope.podcasts = response;
      });
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watch('podcasts', function() {
    $scope.podcasts.forEach(function(podcast) {
      io.socket.get('/podcast/subscribers/' + podcast.id, function (response) {
        if (response.subscribers)
          $scope.statistics[response.podcast] = response.subscribers;
      });
    });
  }, true);

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  io.socket.on('podcast', function (msg) { $scope.init(); });

});
