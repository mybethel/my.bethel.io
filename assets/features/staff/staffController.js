angular.module('Bethel.staff')

.controller('StaffController', function ($rootScope, $scope, $location) {

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

});


