angular.module('Bethel.staff', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff',
      templateUrl: 'templates/staff/staff.html',
      controller: 'StaffController'
    })
    .state('userManagement', {
      url: '/user/:userId',
      templateUrl: 'templates/staff/detailedUser.html',
      controller: 'UserManagementController'
    })
    .state('ministryManagement', {
      url: '/ministry/:ministryId',
      templateUrl: 'templates/staff/detailedMinistry.html',
      controller: 'MinistryManagementController'
    });

})

.controller('StaffController', function ($rootScope, $scope, sailsSocket, $location) {

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    sailsSocket.get('/user', {}, function (response, status) {
      $scope.users = response;
      $scope.orderByField = 'name';
      $scope.reverseSearch = false;
    });
  };

  $scope.init();

})

.controller('UserManagementController', function ($rootScope, $scope, sailsSocket, $stateParams, $location) {

  $scope.id = $stateParams.userId;
  $scope.user = {};

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    sailsSocket.get('/user/' + $scope.id, {}, function (response, status) {
      $scope.user = response;
    });
  };

  $scope.init();

})

.controller('MinistryManagementController', function ($rootScope, $scope, sailsSocket, $stateParams, $location) {

  $scope.id = $stateParams.ministryId;
  $scope.ministry = {};

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    sailsSocket.get('/ministry/' + $scope.id, {}, function (response, status) {
      $scope.ministry = response;
    });
  };

  $scope.init();

});


