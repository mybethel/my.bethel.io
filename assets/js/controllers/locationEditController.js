angular.module('Bethel.dashboard')

.controller('LocationEditController', function ($rootScope, $scope, $state, $stateParams) {

  $scope.id = $stateParams.locationId;
  $scope.location = {};
  $scope.coords = '';

  // Generic save functionality for both new and existing locations.
  $scope.save = function () {
    if ($scope.id) {
      io.socket.put('/location/' + $scope.id, $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    } else {
      io.socket.post('/location/create', $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    }
  };

  // Google Places autocomplete functionality and geocoding.
  var locationData = new google.maps.places.Autocomplete((document.getElementById('location-autocomplete')), { types: ['geocode'] });
  google.maps.event.addListener(locationData, 'place_changed', function() {
    var place = locationData.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();

    $scope.location.address = place.formatted_address;
    $scope.location.latitude = lat;
    $scope.location.longitude = lng;
    $scope.coords = lat.toFixed(2) + ', ' + lng.toFixed(2);
  });

  if (!$scope.id) {
    // Get the CSRF token for validation.
    io.socket.get('/csrfToken', function (response) {
      $scope.location._csrf = response._csrf;
    });
    $scope.location.ministry = $rootScope.ministry.id;

    return;
  }

  // Query the location to display in the edit form.
  io.socket.get('/location/' + $scope.id, function (response) {
    $scope.location = response;
    delete $scope.location.ministry;

    if ($scope.location.loc)
      $scope.coords = $scope.location.loc[0].toFixed(2) + ', ' + $scope.location.loc[1].toFixed(2);

    // Get the CSRF token for validation.
    io.socket.get('/csrfToken', function (response) {
      $scope.location._csrf = response._csrf;
    });
  });

});
