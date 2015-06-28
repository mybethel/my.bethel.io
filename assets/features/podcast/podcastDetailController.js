angular.module('Bethel.podcast')
.run(function() {
  Chart.defaults.global.colours[0] = '#106982';
})
.controller('podcastDetailController', ['$scope', '$state', '$stateParams', 'upload', '$mdDialog', 'sailsSocket',
  function ($scope, $state, $stateParams, upload, $mdDialog, sailsSocket) {

  $scope.id = $stateParams.podcastId;
  $scope.uploading = false;
  $scope.uploadProgress = 0;
  $scope.editing = false;
  $scope.subscriberCount = 0;
  $scope.subscriberChange = 0;

  $scope.subscriberChart = {
    data: [[]],
    labels: [],
    options: {
      scaleShowVerticalLines: false,
      pointHitDetectionRadius: 5
    }
  };

  $scope.init = function() {

    sailsSocket.get('/podcast/edit/' + $scope.id).then(function (data) {
      $scope.podcast = data.podcast;
      $scope.thumbnailS3 = data.s3form;
      $scope.thumbnailUploading = false;
      $scope.uploadEpisode = data.uploadEpisode;
    });

    $scope.podcastStats = sailsSocket.populate('podcast/subscribers/' + $scope.id);

  };

  $scope.init();

  io.socket.on('podcast', function (message) {
    if (message.verb !== 'updated' || message.id !== $scope.podcast.id)
      return;
    $scope.init();
  });

  $scope.$watch('podcast', function (newValue, oldValue) {
    if (!newValue || !oldValue) return;

    sailsSocket.put('/podcast/' + $scope.id, {
      name: newValue.name,
      service: newValue.service,
      sourceMeta: newValue.sourceMeta,
      tags: newValue.tags,
      description: newValue.description,
    }).then(function() {
      $scope.$parent.init();
    });
  }, true);

  $scope.$watch('podcastStats', function (newValue) {
    if (!newValue || !newValue.historical) return;
    $scope.subscriberChart.data[0] = [];
    $scope.subscriberChart.labels = [];
    angular.forEach(newValue.historical, function (subscribers, week) {
      $scope.subscriberChart.data[0].push(subscribers);
      $scope.subscriberChart.labels.push(moment(String(week), 'YYYYw').format('MMM D'));
    });
    $scope.subscriberCount = $scope.subscriberChart.data[0].slice(-2)[0];
    $scope.subscriberCompare = $scope.subscriberChart.data[0].slice(-3)[0];
    $scope.subscriberChange = (($scope.subscriberCount - $scope.subscriberCompare) / $scope.subscriberCompare) * 100;
  }, true);

  $scope.uploadThumbnail = function($files) {
    $scope.thumbnailUploading = true;

    upload.s3($scope.thumbnailS3, $files[0])
      .success(function (data, status, headers, config) {
        sailsSocket.put('/podcast/' + $scope.id, {
          id: $scope.id,
          temporaryImage: $files[0].name
        });
      });
  };

  // Triggered when a file is chosen for upload.
  // On supported browsers, multiple files may be chosen.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.createPodcastMedia($files[i]);
    }
  };

  $scope.createPodcastMedia = function (file) {

    var fileExt = file.name.split('.').pop(),
        fileName = file.name.replace('.' + fileExt, '');

    $scope.uploading = true;

    upload.s3($scope.uploadEpisode, file)
      .progress(function(evt) {
        $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
      })
      .success(function(data, status, headers, config) {

        sailsSocket.post('/podcastmedia', {
          name: fileName,
          date: file.lastModifiedDate,
          url: 'http://cloud.bethel.io/' + encodeURI(fileMeta.key),
          size: file.size,
          podcast: $scope.id,
          type: 'cloud'
        }).then(function (podcast) {
          // Call the endpoint to generate metadata.
          sailsSocket.get('/podcastmedia/meta/' + podcast.id);
          $scope.init();
        });

      });
  };

  $scope.editMedia = function (id) {
    $mdDialog.show({
      clickOutsideToClose: true,
      templateUrl: 'features/podcast/podcastMediaView.html',
      targetEvent: event,
      locals: { mediaId: id },
      controller: 'podcastMediaController'
    });
  };

  $scope.submitPodcast = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      templateUrl: 'features/podcast/podcastSubmitView.html',
      targetEvent: event,
      locals: { id: $scope.id },
      controller: function submitPodcastDialog($scope, id) {
        $scope.feed = 'http://podcast.bethel.io/' + id + '.xml';
      }
    });
  };

}]);
