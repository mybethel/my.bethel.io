angular.module('Bethel.mobile').controller('mobileMediaController', MobileMedia);

function MobileMedia($scope, sailsSocket) {

  $scope.podcasts = sailsSocket.populateMany('podcast', { 'ministry': $scope.$root.ministry.id });

  // Populate the playlist for this ministry.
  // @todo: Support for multiple playlists
  sailsSocket.get('/playlist?ministry=' + $scope.$root.ministry.id).then(function(playlist) {
    $scope.playlist = playlist[0];

    // Create a new playlist if one isn't found.
    if ($scope.playlist) return;
    $scope.playlist = {
      new: true
    };
  });

  $scope.$watch('playlist', function(newValue, oldValue) {
    if (!newValue) return;

    // If this is a new playlist, create it now.
    if (newValue.new) {
      delete newValue.new;
      sailsSocket.post('/playlist', {
        name: 'Semon Series',
        ministry: $scope.$root.ministry.id
      }).then(function(playlist) {
        console.log('POST', playlist)
        $scope.playlist = playlist;
      });
    }
  })

}

MobileMedia.$inject = ['$scope', 'sailsSocket'];
