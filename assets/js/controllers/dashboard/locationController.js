app.controller('LocationController', function ($scope, sailsSocket, $log, filterFilter) {

  $scope.addressFormat = function (string) {
    var address = string.split(',');
    address.pop();
    return address.join(',');
  }

});