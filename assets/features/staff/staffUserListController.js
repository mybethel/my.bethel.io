angular.module('Bethel.staff')

.controller('staffUserListController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', 'sailsSocket', function ($rootScope, $scope, $stateParams, $state, $location, sailsSocket) {

  $scope.$parent.tabIndex = 0;

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    $scope.users = sailsSocket.populateMany('/user');
  };

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
  };

  $scope.init();

}]);
