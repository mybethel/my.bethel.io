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

  $scope.save = function() {
    var method =  'post',
        endpoint = '/location';

    if (locationId) {
      method = 'put';
      endpoint = '/location/' + locationId;
    }

    sailsSocket[method](endpoint, {
      name: $scope.location.name,
      default: $scope.location.default,
      description: $scope.location.description,
      address: $scope.location.address,
      ministry: $scope.$root.ministry
    }).then(function() {
      $mdDialog.hide();
    }, function(err) {
      console.error(err);
    });
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
