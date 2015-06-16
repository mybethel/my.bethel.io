angular.module('Bethel.staff')

.controller('MinistryManagementController', function ($rootScope, $scope, $stateParams, $location) {

  var creatingMinistry = false;

  if ($stateParams.ministryId && !$stateParams.ministryId.match(/^[0-9a-fA-F]{24}$/)) {
    $location.path('/staff/ministries').replace();
  }

  $scope.id = $stateParams.ministryId;
  $scope.ministry = {};
  $scope.$parent.tabIndex = 1;

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    io.socket.get('/ministry/' + $scope.id, function (response, status) {
      $scope.$apply(function() {
        $scope.ministry = response;
      });
    });
  };

  $scope.init();

});
