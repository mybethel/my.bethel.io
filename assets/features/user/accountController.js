angular.module('Bethel.user')
.controller('accountController', ['$scope', 'notifyService', 'sailsSocket',
  function ($scope, notifyService, sailsSocket) {

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
        notifyService.showCommon('saved');
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
        notifyService.showCommon('saved');
      });
    }
  }, true);

  // Prevent the password from staying in scope.
  $scope.$on('$destroy', function() {
    delete($scope.user.password);
  });

}]);
