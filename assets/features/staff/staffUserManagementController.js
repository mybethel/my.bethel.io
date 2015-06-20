angular.module('Bethel.staff')

.controller('staffUserManagementController', function ($rootScope, $scope, $stateParams, $location, $timeout) {

  if ($stateParams.userId && !$stateParams.userId.match(/^[0-9a-fA-F]{24}$/) || $stateParams.userId === '') {
    $location.path('/staff/user').replace();
  }

  $scope.user = {};
  $scope.$parent.tabIndex = 0;

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    io.socket.get('/user/' + $stateParams.userId, function (response, status) {
      $scope.$apply(function() {
        $scope.user = response;
      });
    });

    io.socket.get('/ministry', function (response, status) {
      $scope.$apply(function() {
        $scope.ministries = response;
      });
    });
  };

  $scope.lockUnlock = function() {
    io.socket.get('/user/lockUnlock/' + $stateParams.userId, function (updatedUser, status) {
      $scope.$apply(function() {
        $scope.user.isLocked = updatedUser.isLocked;
      });
    });
  };

  $scope.sendInviteEmail = function() {
    $scope.emailSending = true;
    io.socket.get('/user/sendInvite/' + $stateParams.userId, function (response, status) {
      $scope.emailSending = false;
      $scope.$apply();
    });
  };

  $scope.$watch('emailSending', function() {
    if ($scope.emailSending === false) {
      $timeout(function () {
        delete $scope.emailSending;
      }, 3000);
    }
  });

  $scope.init();

});