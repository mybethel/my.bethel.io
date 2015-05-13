angular.module('Bethel.staff')

.controller('UserListController', function ($rootScope, $scope, $stateParams, $state, $location) {

  $scope.$parent.selectedStaffSection = 'users';

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    io.socket.get('/user', function (response, status) {
      $scope.$apply(function() {
        $scope.users = response;
        $scope.orderByField = 'name';
      });
    });
  };

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
  };

  $scope.init();

});
