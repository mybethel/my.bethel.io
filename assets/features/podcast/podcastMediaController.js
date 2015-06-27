angular.module('Bethel.podcast')
.controller('podcastMediaController', ['$scope', '$mdDialog', 'mediaId', '$sce', '$socket', '$http',
  function ($scope, $mdDialog, mediaId, $sce, $socket, $http) {

  $socket.get('/podcastmedia/' + mediaId).then(function (data) {
    $scope.media = data;
    $scope.media.url = $sce.trustAsResourceUrl('/podcast/embed/episode/' + data.id);
  });

  // Autocomplete for ministries using the Bethel web platform.
  $scope.getSeries = function(query) {
    if (angular.isUndefined($scope.$root.ministry.url))
      return;

    return $http.get($scope.$root.ministry.url + '/bethel/podcaster/autocomplete/' + query)
      .then(function (response){
        return response.data.results;
      });
  };

  $scope.save = function() {
    $socket.put('/podcastmedia/' + mediaId, {
      name: $scope.media.name,
      date: $scope.media.date,
      description: $scope.media.description,
      reference: $scope.media.reference
    }).then(function() {
      $mdDialog.hide();
    });
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
