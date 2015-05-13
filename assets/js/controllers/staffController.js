angular.module('Bethel.staff')

.controller('StaffController', function ($rootScope, $scope, $location) {

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

});


