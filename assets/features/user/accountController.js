angular.module('Bethel.user')
  .controller('accountController', UserAccountController)

function UserAccountController($scope, notifyService, sailsSocket) {

  $scope.user = $scope.$root.user;
  $scope.ministry = $scope.$root.ministry;

  $scope.$watch('user', function(newValue, oldValue) {
    if (newValue === oldValue) return;

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

  $scope.$watch('ministry', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    var updatedMinistry = {
      billing: newValue.billing,
      email: newValue.email,
      locality: newValue.locality,
      name: newValue.name,
      url: newValue.url
    };

    if ($scope.editMinistry.$valid) {
      sailsSocket.put('/ministry/' + newValue.id, updatedMinistry).then(function() {
        notifyService.showCommon('saved');
      });
    }
  }, true);

  // Prevent the password from staying in scope.
  $scope.$on('$destroy', function() {
    if ($scope.user && $scope.user.password) {
      delete $scope.user.password;
    }
  });

}

UserAccountController.$inject = ['$scope', 'notifyService', 'sailsSocket'];
