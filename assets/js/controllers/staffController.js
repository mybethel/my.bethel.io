angular.module('Bethel.staff', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff',
      templateUrl: 'templates/staff/staff.html',
      controller: 'StaffController'
    });

})

.controller('StaffController', function ($rootScope, $scope, sailsSocket, $location) {

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin != 'undefined' && $rootScope.isAdmin == false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    sailsSocket.get('/user', {}, function (response, status) {
      $scope.users = response;
    });
  };

  $scope.init();

});


