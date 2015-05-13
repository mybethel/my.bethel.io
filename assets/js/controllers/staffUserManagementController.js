angular.module('Bethel.staff')

.controller('UserManagementController', function ($rootScope, $scope, $stateParams, $location) {

  if ($stateParams.userId && !$stateParams.userId.match(/^[0-9a-fA-F]{24}$/)) {
    $location.path('/staff/user').replace();
  }

  $scope.user = {};
  $scope.newUser = {};
  $scope.$parent.selectedStaffSection = 'users';

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

  $scope.createUserSubmit = function() {

    $scope.newUser._csrf = $rootScope._csrf;

    if ($scope.newUser.ministry) {
      $scope.newUser.ministry = $scope.newUser.ministry.id;
    }

    console.log('newUser ', $scope.newUser);

    io.socket.post('/user', $scope.newUser,
    function (data) {
      console.log('data ', data);
    });

  };

  $scope.init();

});