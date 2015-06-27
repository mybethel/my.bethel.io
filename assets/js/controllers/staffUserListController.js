angular.module('Bethel.staff')

.controller('UserListController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', '$socket', function ($rootScope, $scope, $stateParams, $state, $location, $socket) {

  $scope.$parent.selectedStaffSection = 'users';

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    $scope.users = $socket.populateList('/user');
  };

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
  };

  $scope.init();

}]);
