angular.module('Bethel.media')

.controller('MediaCollectionController', function ($scope, $rootScope, $state, $stateParams) {

  $scope.showVideo = $scope.showAudio = $scope.showImage = true;
  $scope.filterByCollection = $stateParams.collectionId || 'all';
  $scope.$parent.selectedCollection = $scope.filterByCollection;

  $scope.filterByType = function(type) {
    if (type === 'video')
      $scope.showVideo = !$scope.showVideo;

    if (type === 'audio')
      $scope.showAudio = !$scope.showAudio;

    if (type === 'image')
      $scope.showImage = !$scope.showImage;
  };

  $scope.mediaType = function(media) {
    if ($scope.showVideo && media.type === 'video')
      return true;

    if ($scope.showAudio && media.type === 'audio')
      return true;

    if ($scope.showImage && media.type === 'image')
      return true;

    return false;
  };

  $scope.showCollection = function(collection) {
    if (!$state.is('media')) {
      $state.go('media', { collectionId: 'me'});
    }
  };

  $scope.init = function() {
    $scope.$parent.init();
    io.socket.get('/media/browser/' + $scope.filterByCollection, function (data) {
      $scope.media = data.media;
      $scope.upload = data.upload;
      $scope.selectedCollection = data.selectedCollection;
      $scope.$apply();
    });
  };

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  $scope.indexOfMediaWithId = function(id) {
    if ($scope.media.length < 1)
      return;

    for (var i = 0; i < $scope.media.length; i++) {
      if ($scope.media[i].id === id) {
        return i;
      }
    }
  };

  // Called when any media is uploaded, modified or deleted.
  // @todo: Update only the record in the message rather than the entire scope.
  io.socket.on('media', function (msg) { $scope.init(); });

});
