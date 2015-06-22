angular.module('Bethel.staff')

.controller('staffUserCreateController', ['$scope', '$timeout', '$location', '$mdDialog', 'ministries',
  function ($scope, $timeout, $location, $mdDialog, ministries) {

  $scope.newUser = {};
  $scope.existing = {isExisting: "existing"};
  $scope.ministries = ministries;
  $scope.searchText = "";

  $scope.$watch('existing.isExisting', function (existing) {
    if (existing === 'new') {
      delete $scope.newUser.ministry;
    } else if (existing === 'existing') {
      delete $scope.newUser.newMinistry;
    }
  });

  $scope.createUserSubmit = function() {

    var newMinistry = $scope.newUser.newMinistry;

    if (newMinistry) {

      io.socket.post('/ministry', {
        name: newMinistry,
        _csrf: $scope.$root._csrf
      }, function (ministry) {
        $scope.ministries.push(ministry);
        $scope.newMinistry = ministry;
        $scope.createNewUser(ministry);
      });

    } else {
      $scope.createNewUser();
    }

  };

  $scope.createNewUser = function(ministry) {

    var newUser = $scope.newUser;

    newUser._csrf = $scope.$root._csrf;
    newUser.isLocked = false;

    if (ministry) {
      newUser.ministry = $scope.newMinistry.id;
    } else {
      newUser.ministry = newUser.ministry.id;
    }

    io.socket.post('/user', newUser, function (res) {
      if (res.invalidAttributes) {
        $scope.createErrors(res);
      } else {
        $mdDialog.hide(res);
      }
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
      $scope.newUser.ministry = $scope.newMinistry;
    }

  };

  $timeout(function () {
    document.querySelector('input.focus').focus();
  });

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);


