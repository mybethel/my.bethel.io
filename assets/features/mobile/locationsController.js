angular.module('Bethel.mobile')
.controller('mobileLocationsController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.locations = sailsSocket.populateMany('location/ministry');
  sailsSocket.sync($scope.locations, 'location');

  $scope.toggleEnabled = function(location) {
    sailsSocket.put('/location/' + location.id, { active: location.active });
  };

}]);
