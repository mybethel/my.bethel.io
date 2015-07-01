angular.module('Bethel.staff')

.controller('staffMinistryDetailController', ['$scope', '$stateParams', '$location', '$socket',
  function ($scope, $stateParams, $location, $socket) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 1;

  $scope.$watch(function() {
    return $stateParams.ministryId;
  }, function (newValue, oldValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/ministry').replace();
    }
  });

  $ctrl.populateMinistry = function(response, status) {
    $scope.ministry = response;
  };

  $ctrl.init = function() {
    $socket.get('/ministry/' + $stateParams.ministryId).then($ctrl.populateMinistry);
  };

  $ctrl.init();

}]);
