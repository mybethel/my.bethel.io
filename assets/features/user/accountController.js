angular.module('Bethel.user')
.controller('accountController', ['$scope', '$mdToast', 'sailsSocket',
  function ($scope, $mdToast, sailsSocket) {

  var savedAlert = $mdToast.simple()
                      .content('Your changes have been saved!')
                      .position('bottom right')
                      .hideDelay(3000);

  $scope.$watch('user', function (newValue, oldValue) {
    if (newValue === oldValue) return;

    // if (newValue.email === oldValue.email) {
    //   console.log('invalid? ', $scope.editUser.email.$invalid);
    //   $scope.editUser.email.$setValidity('unique', true);
    // }

    var updatedUser = {
      name: newValue.name,
      email: newValue.email
    };

    if (newValue.password) {
      updatedUser.password = newValue.password;
    }

    if ($scope.editUser.$valid) {
      sailsSocket.put('/user/' + newValue.id, updatedUser).then(function() {
        $mdToast.show(savedAlert);
      });
    }
  }, true);

  $scope.$watch('ministry', function (newValue, oldValue) {
    if (newValue === oldValue) return;

    var updatedMinistry = {
      name: newValue.name,
      email: newValue.email,
      locality: newValue.locality
    };

    if ($scope.editMinistry.$valid) {
      sailsSocket.put('/ministry/' + newValue.id, updatedMinistry).then(function () {
        $mdToast.show(savedAlert);
      });
    }
  }, true);

  // Prevent the password from staying in scope.
  $scope.$on('$destroy', function() {
    delete($scope.user.password);
  });

}]);
