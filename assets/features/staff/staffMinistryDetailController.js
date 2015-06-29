angular.module('Bethel.staff')

.controller('staffMinistryDetailController', ['$scope', '$stateParams', '$location', '$socket',
  function ($scope, $stateParams, $location, $socket) {

  $scope.$parent.tabIndex = 1;
  $scope.creatingMinistry = false;

  $scope.$watch(function() {
    return $stateParams.ministryId;
  }, function (newValue, oldValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/ministry').replace();
    }
  });

  $scope.populateMinistry = function(response, status) {
    $scope.ministry = response;
  }

  $socket.get('/ministry/' + $stateParams.ministryId).then($scope.populateMinistry);

}]);
