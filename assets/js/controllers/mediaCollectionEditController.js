angular.module('Bethel.media')

.controller('MediaCollectionEditController', function ($scope, $rootScope, $stateParams, $upload, $sce) {
  $scope.init = function() {
    io.socket.get('/media/' + $stateParams.collectionId, function (data) {
      $scope.collection = data;
      $scope.collection.description = $sce.trustAsHtml(data.description);
      $scope.$apply();

      new MediumEditor('.collection-title', { disableToolbar: true, disableReturn: true });
      new MediumEditor('.collection-description');
    });
  };

  $('.collection-title').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.collection.id, {
      name: $('.collection-title').text(),
      _csrf: $rootScope._csrf
    }, function () {
      // Trigger a refresh since socket doesn't emit to the same browser that broadcasts.
      $scope.$parent.init();
    });
  }));

  $('.collection-description').on('input', $.debounce(250, function() {
    io.socket.put('/media/' + $scope.collection.id, {
      description: $('.collection-description').html(),
      _csrf: $rootScope._csrf
    });
  }));

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  // Triggered when a file is chosen for upload.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.uploadFile('media/' + $scope.collection.ministry.id + '/' + $scope.collection.id + '/' + $files[i].name, $files[i]);
    }
  };

  $scope.uploadFile = function (location, file) {
    var fileMeta = {
      key: location,
      AWSAccessKeyId: $scope.upload.key, 
      acl: 'public-read',
      policy: $scope.upload.policy,
      signature: $scope.upload.signature,
    };

    $upload.upload({
      url: $scope.upload.action,
      method: 'POST',
      data: fileMeta,
      file: file,
    })
    .progress(function(evt) {
      $scope.thumbnailUploading = true;
    })
    .success(function(data, status, headers, config) {
      $scope.thumbnailUploading = false;
      $scope.collection.posterFrame = 'custom';
      $scope.collection.posterFrameCustom = location;
      io.socket.put('/media/' + $scope.collection.id, {
        posterFrame: 'custom',
        posterFrameCustom: location,
        _csrf: $rootScope._csrf
      });
    });
  };
});
