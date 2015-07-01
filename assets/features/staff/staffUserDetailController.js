angular.module('Bethel.staff')

.controller('staffUserDetailController', ['$scope', '$stateParams', '$location', '$socket', '$timeout',
  function ($scope, $stateParams, $location, $socket, $timeout) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 0;

  $scope.$watch(function() {
    return $stateParams.userId;
  }, function (newValue, oldValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/user').replace();
    }
  });

  $ctrl.populateUser = function(response, status) {
    $scope.user = response;
  };

  $ctrl.init = function() {
    $socket.get('/user/' + $stateParams.userId).then($ctrl.populateUser);
  };

  $ctrl.setLockedStatus = function(updatedUser, status) {
    $scope.user.isLocked = updatedUser.isLocked;
  };

  $scope.lockUnlock = function() {
    $socket.get('/user/lockUnlock/' + $stateParams.userId).then($ctrl.setLockedStatus);
  };

  $ctrl.getEmailConfirmation = function(response, status) {
    $scope.emailSending = false;
  };

  $scope.sendInviteEmail = function() {
    $scope.emailSending = true;
    $socket.get('/user/sendInvite/' + $stateParams.userId).then($ctrl.getEmailConfirmation);
  };

  $scope.$watch('emailSending', function() {
    if ($scope.emailSending === false) {
      $timeout(function () {
        delete $scope.emailSending;
      }, 3000);
    }
  });

  $ctrl.init();

}]);