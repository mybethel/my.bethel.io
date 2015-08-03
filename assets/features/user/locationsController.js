angular.module('Bethel.user')
.filter('addressShort', function() {
  return function(address) {
    var short = address.split(',').slice(0, -2).join(',');
    return short || address;
  }
})
.controller('locationsController', ['$scope', '$mdDialog', 'sailsSocket',
  function ($scope, $mdDialog, sailsSocket) {

  $scope.locations = sailsSocket.populateMany('location/ministry');
  sailsSocket.sync($scope.locations, 'location');

  $scope.map = {
    center: {
      latitude: 45,
      longitude: -73
    },
    options: {
      zoomControl: false,
      panControl: false,
      mapTypeControl: false,
      scrollwheel: false,
      navigationControl: false,
      draggable: false,
      streetViewControl: false,
      maxZoom: 15
    },
    zoom: 2
  };

  $scope.$watch('locations', function(newValue) {
    if (!newValue) return;
    // @todo: Different icons depending on the type of location.
    angular.forEach(newValue, function(value, index) {
      $scope.locations[index].pin = 'https://s3.amazonaws.com/static.bethel.io/images/pin.png';
    });
  }, true);

  $scope.locationForm = function(event, id) {
    $mdDialog.show({
      clickOutsideToClose: true,
      controller: 'locationDetailController',
      focusOnOpen: false,
      locals: { locationId: id },
      targetEvent: event,
      templateUrl: 'features/user/locationDetailView.html'
    });
  }

}]);
