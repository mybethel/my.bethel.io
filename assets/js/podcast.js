angular.module('Bethel.podcast', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('podcast', {
      url: '/podcasts',
      templateUrl: 'templates/podcast/list.html',
      controller: 'PodcastListCtrl'
    });

})

.controller('PodcastListCtrl', function ($scope, $log, filterFilter) {

  $scope.podcasts = [];
  $scope.statistics = [];

  $scope.init = function() {
    io.socket.get('/podcast/list', function (response) {
      $scope.podcasts = response;
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

  $scope.init();

  $scope.$on('sailsSocket:connect', function() { $scope.init(); });
  $scope.$on('event:auth-loginConfirmed', function() { $scope.init(); });

});


jQuery(document).ready(function($) {
  $('button.sidebar-submit').click(function() {
    $('form.sidebar-form').submit();
  });

  if ($('#podcastVisits').data('visits')) {
    var podcastVisitData = JSON.parse('[' + $('#podcastVisits').data('visits') + ']');
    $("#podcastVisits").sparkline(podcastVisitData, {
      type: 'line',
      width: '96%',
      height: '50px',
      lineColor: '#106982',
      spotColor: '#1591b5',
      minSpotColor: '#d2322d',
      maxSpotColor: '#5cb85c',
      fillColor: null,
      highlightSpotColor: '#1591b5',
      highlightLineColor: null,
      lineWidth: 2,
      spotRadius: 3
    });
  }

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
