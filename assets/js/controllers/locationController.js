angular.module('Bethel.dashboard')

.controller('LocationController', function ($scope) {

  $scope.addressFormat = function (string) {
    var address = string.split(',');
    address.pop();
    return address.join(',');
  };

});
