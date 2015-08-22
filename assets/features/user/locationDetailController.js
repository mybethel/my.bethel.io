angular.module('Bethel.user')
.controller('locationDetailController', ['$http', '$mdDialog', '$sce', '$scope', '$timeout', 'locationId', 'sailsSocket',
  function ($http, $mdDialog, $sce, $scope, $timeout, locationId, sailsSocket) {

  // Focus on the first field when the modal opens.
  $timeout(function() {
    document.querySelector('input.focus').focus();
  });

  $scope.new = true;

  if (locationId) {
    $scope.new = false;
    $scope.location = sailsSocket.populateOne('location/' + locationId);
  }

  $scope.$watch('addressDetails', function (newValue) {
    if (!newValue || !newValue.geometry) return;
    $scope.location.longitude = newValue.geometry.location.lng();
    $scope.location.latitude = newValue.geometry.location.lat()
  });

  $scope.save = function() {
    if ($scope.locationDetail.$invalid) return;

    var method =  'post',
        endpoint = '/location';

    var locationPayload = {
      name: $scope.location.name,
      default: $scope.location.default,
      description: $scope.location.description,
      address: $scope.location.address,
      longitude: $scope.location.longitude,
      latitude: $scope.location.latitude,
      ministry: $scope.$root.ministry
    };

    if (locationId) {
      method = 'put';
      endpoint = '/location/' + locationId;
      delete(locationPayload.ministry);
    }

    sailsSocket[method](endpoint, locationPayload).then(function() {
      $mdDialog.hide();
    }, function(err) {
      console.error(err);
    });
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
