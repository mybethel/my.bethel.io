angular.module('Bethel.mobile').controller('mobileMediaController', MobileMedia);

function MobileMedia($scope, notifyService, sailsSocket) {

  this.init = function() {
    // Populate the playlist for this ministry.
    // @todo: Support for multiple playlists
    sailsSocket.get('/playlist?name=Sermon+Series&ministry=' + $scope.$root.ministry.id).then(function(playlist) {
      $scope.playlist = playlist[0];

      // Create a new playlist if one isn't found.
      if ($scope.playlist) return;
      $scope.playlist = {
        new: true
      };
    });
  };

  this.populateMedia = function() {
    sailsSocket.get('/playlist/' + $scope.playlist.id).then(function(playlist) {
      $scope.media = playlist.media;
    });
  };

  var $ctrl = this;

  $scope.playlistSettings = false;
  $scope.podcasts = sailsSocket.populateMany('podcast', { 'ministry': $scope.$root.ministry.id });

  $scope.playlistToggle = function() {
    $scope.playlistSettings = !$scope.playlistSettings;
  };

  sailsSocket.editable($scope, 'playlist', ['podcastAudio', 'podcastVideo'], function() {
    notifyService.showCommon('saved');
    $ctrl.populateMedia();
  });

  $scope.$watch('playlist', function(newValue, oldValue) {
    if (!newValue) return;

    $ctrl.populateMedia();

    // If this is a new playlist, create it now.
    if (newValue.new) {
      delete newValue.new;
      sailsSocket.post('/playlist', {
        name: 'Sermon Series',
        ministry: $scope.$root.ministry.id
      }).then(function(playlist) {
        $scope.playlist = playlist;
        $ctrl.populateMedia();
      });
    }
  });

  // Bind the podcast list over socket.io for this ministry.
  $scope.$root.$watch('ministry', function (newValue) {
    if (!newValue || !newValue.id) return;
    $ctrl.init();
  });

}

MobileMedia.$inject = ['$scope', 'notifyService', 'sailsSocket'];
