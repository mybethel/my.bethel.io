angular.module('Bethel.userManagement', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('userManagement', {
      url: '/user/:userId',
      templateUrl: 'templates/userManagement/user.html',
      controller: 'userManagementController'
    });

})

.controller('userManagementController', function ($rootScope, $scope, sailsSocket, $stateParams, $location) {

  $scope.id = $stateParams.userId;
  $scope.user = {};

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin != 'undefined' && $rootScope.isAdmin == false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    sailsSocket.get('/user/' + $scope.id, {}, function (response, status) {
      $scope.user = response;
    });
  };

  $scope.init();

});

