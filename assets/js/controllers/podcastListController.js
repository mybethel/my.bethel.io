angular.module('Bethel.podcast')

.controller('PodcastListController', function ($rootScope, $scope, $sailsBind) {

  // Bind the podcast list over socket.io for this ministry.
  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $sailsBind.bind('podcast', $scope, { 'ministry': $rootScope.ministry.id });
  });

  // Fetch stats for each of the podcasts.
  $scope.$watch('podcasts', function() {
    if (typeof $scope.podcasts === 'undefined')
      return;

    $scope.podcasts.forEach(function(podcast) {
      io.socket.get('/podcast/subscribers/' + podcast.id, function (response) {
        if (response.subscribers)
          $scope.statistics[response.podcast] = response.subscribers;
      });
    });
  });

});
