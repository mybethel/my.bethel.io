angular.module('Bethel.staff')

.controller('UserListController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', 'sailsSocket', function ($rootScope, $scope, $stateParams, $state, $location, sailsSocket) {

  $scope.$parent.selectedStaffSection = 'users';

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    $scope.users = sailsSocket.populateList('/user');
  };

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
  };

  $scope.init();

}]);
