angular.module('Bethel.staff')

.controller('staffUserManagementController', function ($rootScope, $scope, $stateParams, $location, $timeout) {

  if ($stateParams.userId && !$stateParams.userId.match(/^[0-9a-fA-F]{24}$/) || $stateParams.userId === '') {
    $location.path('/staff/user').replace();
  }

  $scope.user = {};
  $scope.newUser = {};
  $scope.existing = {isExisting: "existing"};
  $scope.$parent.tabIndex = 0;

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.$watch('existing.isExisting', function (existing) {
    if (existing === 'new') {
      delete $scope.newUser.ministry;
    } else if (existing === 'existing') {
      delete $scope.newUser.newMinistry;
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

  $scope.createUserSubmit = function() {

    var newMinistry = $scope.newUser.newMinistry;

    if (newMinistry) {

      io.socket.post('/ministry', {
        name: newMinistry,
        _csrf: $rootScope._csrf
      }, function (ministry) {
        $scope.$apply(function() {
          $scope.ministries.push(ministry);
          $scope.newMinistry = ministry;
        });
        $scope.createNewUser(ministry);
      });

    } else {
      $scope.createNewUser();
    }

  };

  $scope.createNewUser = function(ministry) {

    var newUser = $scope.newUser;

    newUser._csrf = $rootScope._csrf;
    newUser.isLocked = false;

    if (ministry) {
      newUser.ministry = $scope.newMinistry.id;
    }

    io.socket.post('/user', newUser, function (res) {
      if (res.invalidAttributes) {
        $scope.createErrors(res);
      } else {
        $location.path('/staff/user/' + res.id).replace();
      }
      $scope.$apply();
    });

  };

  $scope.createErrors = function(validationErrors) {

    var invalidAttributes = validationErrors.invalidAttributes;

    $scope.errors = {};
    $scope.errors.summary = validationErrors.summary;
    $scope.errors.many = [];

    for (var field in invalidAttributes) {
      invalidAttributes[field].forEach(function (error) {
        $scope.errors.many.push(error.message);
      });
    }

    if ($scope.newMinistry) {
      $scope.existing.isExisting = "existing";
      $scope.newUser.ministry = $scope.newMinistry.id;
    }

  };

  $scope.init();

});