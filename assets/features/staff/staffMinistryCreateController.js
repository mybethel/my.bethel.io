angular.module('Bethel.staff')

.controller('staffMinistryCreateController', ['$scope', '$timeout', '$socket', '$mdDialog',
  function ($scope, $timeout, $socket, $mdDialog) {

  $scope.createNewMinistry = function() {

    $socket.post('/ministry', {name: $scope.newMinistry.name, _csrf: $scope.$root._csrf})
    .then(function (data) {
      $mdDialog.hide(data);
    });

  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $timeout(function () {
    document.querySelector('input.focus').focus();
  });

}]);


