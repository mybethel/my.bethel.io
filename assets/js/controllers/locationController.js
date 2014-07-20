app.controller('LocationController', function ($scope, sailsSocket, $log, filterFilter) {

  $scope.locations = [];

  sailsSocket.get('/location/ministry', {}, function (response, status) {
    $scope.locations = response;
  });

  $scope.addressFormat = function (string) {
    var address = string.split(',');
    address.pop();
    return address.join(',');
  }

});