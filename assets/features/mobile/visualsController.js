angular.module('Bethel.mobile').controller('visualsController', VisualsController);

function VisualsController($scope, sailsSocket, upload) {

  $scope.$watch('ministry', function() {
    if (typeof $scope.ministry.color !== 'object') $scope.ministry.color = {};
    sailsSocket.get('/ministry/edit/' + $scope.ministry.id).then(function(data) {
      $scope.coverUpload = data.cover;
    });
  });

  $scope.$watch('ministry.subtitle', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { subtitle: newValue });
  });

  $scope.$watch('ministry.color', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { color: newValue });
  }, true);

  $scope.uploadCover = function($files) {
    if (!$files || $files.length < 1) return;
    $scope.coverUploading = true;

    upload.s3($scope.coverUpload, $files[0], 'cover' + Date.now())
      .then(function(response) {
        var coverImage = response.config.fields.key.replace('images/', '');
        $scope.ministry.coverImage = coverImage;
        sailsSocket.put('/ministry/' + $scope.ministry.id, { coverImage: coverImage });
      });
  };

}

VisualsController.$inject = ['$scope', 'sailsSocket', 'upload'];
