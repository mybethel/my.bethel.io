app.controller('LocationController', function ($scope, sailsSocket, $log, filterFilter) {

  $scope.locations = [];

  sailsSocket.get('/location/ministry', {}, function (response, status) {
    $scope.locations = response;
  });

});