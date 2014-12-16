angular.module('Bethel.podcast', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('podcast', {
      url: '/podcast',
      templateUrl: 'templates/podcast/index.html',
      controller: 'PodcastListCtrl'
    })
    .state('podcastview', {
      url: '/podcast/:podcastId',
      templateUrl: 'templates/podcast/view.html',
      controller: 'PodcastViewCtrl'
    });

})

.controller('PodcastListCtrl', function ($rootScope, $scope) {

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

})

.controller('PodcastViewCtrl', function ($rootScope, $scope, $state, $stateParams, $upload) {

  $scope.id = $stateParams.podcastId;
  $scope.uploadProgress = 0;

  io.socket.get('/podcast/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.podcast = data;
    });
  });

  io.socket.get('/podcast/edit/' + $scope.id, function (data) {
    $scope.$apply(function() {
      $scope.uploadEpisode = data.uploadEpisode;
    });
  });

  // Triggered when a file is chosen for upload.
  // On supported browsers, multiple files may be chosen.
  $scope.onFileSelect = function ($files) {
    for (var i = 0; i < $files.length; i++) {
      $scope.createPodcastMedia($files[i]);
    }
  };

  $scope.createPodcastMedia = function (file) {

    var fileMeta = {
      key: $scope.uploadEpisode.bucket + '/' + file.name,
      AWSAccessKeyId: $scope.uploadEpisode.key,
      acl: 'public-read',
      policy: $scope.uploadEpisode.policy,
      signature: $scope.uploadEpisode.signature,
    };

    $upload.upload({
      url: $scope.uploadEpisode.action,
      method: 'POST',
      data: fileMeta,
      file: file,
    })
    .progress(function(evt) {
      $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
    })
    .success(function(data, status, headers, config) {
      io.socket.get('/podcastmedia/refresh', function() {
        $state.go($state.$current, null, { reload: true });
      });
    });
  };

});


jQuery(document).ready(function($) {

  $('table.podcast-media').on('click', '.media-edit-button', function() {
    if ($(this).text() == 'Cancel') {
      var episodeTitle = $(this).closest('tr').find('h4');
      episodeTitle.text(episodeTitle.attr('value'));
      $(this).text('Edit');
      $(this).closest('tr').next().find('form').slideToggle();
    } else {
      $(this).closest('tr').next().find('td').load('/podcastmedia/edit/' + $(this).data('source'), function() {
        var podcastForm = $(this).find('form');
        podcastForm.slideToggle();

        var cloudConnectorUrl = $('table.podcast-media').data('url');

        if (cloudConnectorUrl) {
          cloudConnectorUrl = cloudConnectorUrl.replace(/(\/)$/, '');

          $(".podcast-media-edit #episodeConnection").typeahead({
            source: function(query,process) {
              return $.get(cloudConnectorUrl + '/bethel/podcaster/autocomplete/' + query, function(data) {
                return process(data.results);
              });
            }
          });
        }

        $(this).find('.episode-date').datepicker({
          format: 'm-d-yyyy',
        });
        $('.podcast-media-edit #episodeTitle').keyup(updateMediaBinding);
        $('.podcast-media-edit #episodeTitle').change(updateMediaBinding);
        podcastForm.ajaxForm(function() {
          podcastForm.slideToggle();
          podcastForm.closest('tr').prev().find('.media-edit-button').text('Edit');
        });
      });
      $(this).text('Cancel');
    }
  });

  var updateMediaBinding = function(element) {
    var binding = '.' + $(this).attr('binding') + ' h4';

    if ($(this).val()) {
      $(binding).text($(this).val());
    } else {
      $(binding).text($(binding).attr('value'));
    }
  }
});
