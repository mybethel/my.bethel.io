angular.module('Bethel.staff')

.controller('staffUserCreateController', ['$scope', '$timeout', 'sailsSocket', '$mdDialog', 'ministries',
  function ($scope, $timeout, sailsSocket, $mdDialog, ministries) {

  $ctrl = this;
  $scope.ministries = ministries;
  $scope.searchText = "";
  $scope.newUser = {};

  $scope.$watch('searchText', function (searchText) {
    if (!searchText && !$scope.newUser.ministry) {
      $scope.createUser.$setValidity('ministry', false);
    } else {
      $scope.createUser.$setValidity('ministry', true);
    }
  });

  $ctrl.populateMinistries = function(createdMinistry, status) {
    $scope.ministries.push(createdMinistry);
    $scope.createNewUser(createdMinistry);
  };

  $scope.createUserSubmit = function(sender) {

    if (sender.$invalid) return;

    // check for ministry name based on searchText
    if (!$scope.newUser.ministry) {
      angular.forEach(ministries, function (ministry) {
        if (ministry.name.toLowerCase() === $scope.searchText.toLowerCase()) {
          $scope.newUser.ministry = ministry;
        }
      });
    }

    if (!$scope.newUser.ministry) {

      var ministryToCreate = {
            name: $scope.searchText,
            _csrf: $scope.$root._csrf
          };

      sailsSocket.post('/ministry', ministryToCreate).then($ctrl.populateMinistries);

    } else {
      $scope.createNewUser();
    }

  };

  $ctrl.handleNewUser = function(response, status) {
    if (response.invalidAttributes) {
      return;
    } else {
      $mdDialog.hide(response);
    }
  };

  $scope.createNewUser = function(createdMinistry) {

    var newUser = $scope.newUser;

    newUser._csrf = $scope.$root._csrf;
    newUser.isLocked = false;

    if (createdMinistry) {
      newUser.ministry = createdMinistry.id;
    } else {
      newUser.ministry = newUser.ministry.id;
    }

    sailsSocket.post('/user', newUser).then($ctrl.handleNewUser);

  };

  $timeout(function () {
    document.querySelector('input.focus').focus();
  }, 100);

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);


