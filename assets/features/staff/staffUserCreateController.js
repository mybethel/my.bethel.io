angular.module('Bethel.staff')

.controller('staffUserCreateController', ['$scope', '$timeout', '$location', 'sailsSocket', '$mdDialog', 'ministries',
  function ($scope, $timeout, $location, sailsSocket, $mdDialog, ministries) {

  $ctrl = this;
  $scope.existing = {isExisting: "existing"};
  $scope.ministries = ministries;
  $scope.searchText = "";
  $scope.newUser = {};

  $scope.$watch('existing.isExisting', function (existing) {
    if (existing === 'new' && $scope.newUser.ministry) {
      delete $scope.newUser.ministry;
    } else if (existing === 'existing' && $scope.newUser.newMinistry) {
      delete $scope.newUser.newMinistry;
    }
  });

  $ctrl.populateMinistries = function(response, status) {
    $scope.ministries.push(response);
    $scope.newMinistry = response;
    $scope.createNewUser(response);
  };

  $scope.createUserSubmit = function() {

    var newMinistry = $scope.newUser.newMinistry;

    if (newMinistry) {

      var ministryToCreate = {
            name: newMinistry,
            _csrf: $scope.$root._csrf
          };

      sailsSocket.post('/ministry', ministryToCreate).then($ctrl.populateMinistries);

    } else {
      $scope.createNewUser();
    }

  };

  $ctrl.handleNewUser = function(response, status) {
    if (response.invalidAttributes) {
      $ctrl.createErrors(response);
    } else {
      $mdDialog.hide(response);
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

    sailsSocket.post('/user', newUser).then($ctrl.handleNewUser);

  };

  $ctrl.createErrors = function(validationErrors) {

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
  }, 100);

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);


