angular.module('Bethel.staff')

.controller('staffMinistryDetailController', ['$scope', '$stateParams', '$location', 'sailsSocket',
  function ($scope, $stateParams, $location, sailsSocket) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 1;
  $scope.id = $stateParams.ministryId;

  $scope.$watch(function() {
    return $scope.id;
  }, function (newValue, oldValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/ministry').replace();
    }
  });

  $ctrl.init = function() {
    $scope.ministry = sailsSocket.populateOne('/ministry/' + $scope.id);
  };

  $ctrl.init();

}]);
