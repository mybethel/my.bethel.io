angular.module('Bethel.staff')

.controller('staffMinistryDetailController', ['$scope', '$stateParams', '$location', '$filter', 'sailsSocket',
  function ($scope, $stateParams, $location, $filter, sailsSocket) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 1;
  $scope.id = $stateParams.ministryId;
  $scope.ministry = {};

  $scope.$watch(function() {
    return $scope.id;
  }, function (newValue, oldValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/ministry').replace();
    }
  });

  $ctrl.populateMinistry = function(ministry) {
    ministry.createdAt = $filter('date')(ministry.createdAt);
    $scope.ministry = ministry;
  }

  $ctrl.init = function() {
    $scope.billDate = new Date();
    $scope.currentBill = sailsSocket.populateOne('invoice/ministry/' + $scope.id);

    sailsSocket.get('/ministry/' + $scope.id).then($ctrl.populateMinistry);
  };

  $ctrl.init();

}]);
