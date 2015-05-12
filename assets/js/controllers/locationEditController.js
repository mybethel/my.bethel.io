angular.module('Bethel.dashboard')

.controller('LocationEditController', function ($rootScope, $scope, $state, $stateParams) {

  $scope.id = $stateParams.locationId;
  $scope.location = {};
  $scope.coords = '';

  // Generic save functionality for both new and existing locations.
  $scope.save = function () {
    $scope.location._csrf = $scope.$root._csrf;
    if ($scope.id) {
      io.socket.put('/location/' + $scope.id, $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    } else {
      $scope.location.ministry = $rootScope.ministry.id;
      io.socket.post('/location/create', $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    }
  };

  $scope.$watch('locationDetails', function (newValue, oldValue) {
    if (!newValue || newValue === oldValue)
      return;

    var lat = newValue.geometry.location.lat();
    var lng = newValue.geometry.location.lng();
    $scope.location.address = newValue.formatted_address;
    $scope.location.latitude = lat;
    $scope.location.longitude = lng;
    $scope.coords = lat.toFixed(2) + ', ' + lng.toFixed(2);
  });

  // Query the location to display in the edit form.
  io.socket.get('/location/' + $scope.id, function (response) {
    $scope.location = response;
    delete $scope.location.ministry;

    if ($scope.location.loc)
      $scope.coords = $scope.location.loc[0].toFixed(2) + ', ' + $scope.location.loc[1].toFixed(2);

    $scope.$apply();
  });

});
