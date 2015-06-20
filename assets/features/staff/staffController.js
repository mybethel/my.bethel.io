angular.module('Bethel.staff')

.controller('staffController', ['$rootScope', '$scope', '$location', '$mdDialog',
  function ($rootScope, $scope, $location, $mdDialog) {

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.$on('$locationChangeStart', function() {
    if ($location.path() === '/staff') {
      $location.path('/staff/user').replace();
    }
  });

}]);


