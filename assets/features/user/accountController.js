angular.module('Bethel.user')
.controller('accountController', ['$scope', '$mdToast', 'sailsSocket',
  function ($scope, $mdToast, sailsSocket) {

  var savedAlert = $mdToast.simple()
                      .content('Your changes have been saved!')
                      .position('bottom right')
                      .hideDelay(3000);

  $scope.$watch('user', function(newValue, oldValue) {
    if (newValue === oldValue || !oldValue) return;

    var updatedUser = {
      name: newValue.name,
      email: newValue.email
    };

    if (newValue.password) {
      updatedUser.password = newValue.password;
    }

    sailsSocket.put('/user/' + newValue.id, updatedUser).then(function() {
      $mdToast.show(savedAlert);
    });
  }, true);

  // Prevent the password from staying in scope.
  $scope.$on('$destroy', function() {
    delete($scope.user.password);
  });

}]);
