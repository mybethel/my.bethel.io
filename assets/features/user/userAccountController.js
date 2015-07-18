angular.module('Bethel.user')
.controller('userAccountController', ['$scope', '$mdToast', function ($scope, $mdToast) {

  $scope.$watch('user', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    $mdToast.show(
      $mdToast.simple()
        .content('Your changes have been saved!')
        .position('bottom right')
        .hideDelay(3000));
  }, true);

}]);
