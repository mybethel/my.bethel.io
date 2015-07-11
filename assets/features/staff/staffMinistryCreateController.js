angular.module('Bethel.staff')

.controller('staffMinistryCreateController', ['$scope', '$timeout', 'sailsSocket', '$mdDialog',
  function ($scope, $timeout, sailsSocket, $mdDialog) {

  $scope.createNewMinistry = function() {

    sailsSocket.post('/ministry', {name: $scope.newMinistry.name, _csrf: $scope.$root._csrf})
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


