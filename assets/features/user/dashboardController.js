angular.module('Bethel.user')
.controller('dashboardController', ['$scope', '$http',
  function ($scope, $http) {

  var blogUrl = encodeURIComponent('http://blog.bethel.io/tag/platform-updates/rss/');
  $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + blogUrl).then(function(res) {
    angular.forEach(res.data.responseData.feed.entries, function(entry, index) {
      res.data.responseData.feed.entries[index].publishedDate = new Date(entry.publishedDate);
    });
    $scope.platformUpdates = res.data.responseData.feed.entries;
  });

  $scope.loadUpdate = function(update) {
    window.open(update.link);
  };

}]);
