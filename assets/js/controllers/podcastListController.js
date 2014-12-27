angular.module('Bethel.podcast')

.controller('PodcastListController', function ($rootScope, $scope, $sailsBind) {

  $scope.statistics = {};

  // Bind the podcast list over socket.io for this ministry.
  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $sailsBind.bind('podcast', $scope, { 'ministry': $rootScope.ministry.id });
  });

  var getSubscriberCount = function(podcast) {
    io.socket.get('/podcast/subscribers/' + podcast.id, function (response) {
      $scope.$apply(function() {
        $scope.statistics[podcast.id] = 0;
      });
    });
  };

  // Fetch stats for each of the podcasts.
  $scope.$watchCollection('podcasts', function() {
    if (typeof $scope.podcasts === 'undefined')
      return;

    $scope.podcasts.forEach(getSubscriberCount);
  });

});
