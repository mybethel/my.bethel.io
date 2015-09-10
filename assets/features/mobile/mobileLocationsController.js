angular.module('Bethel.mobile')
.controller('mobileLocationsController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.locations = sailsSocket.populateMany('location/ministry');

}]);
