angular.module('Bethel.staff')

.controller('staffUserDetailController', ['$scope', '$stateParams', '$location', '$filter', 'sailsSocket', '$timeout', '$mdToast',
  function ($scope, $stateParams, $location, $filter, sailsSocket, $timeout, $mdToast) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 0;
  $scope.id = $stateParams.userId;

  $scope.$watch(function() {
    return $scope.id;
  }, function (newValue) {
    if (!newValue || !newValue.match(/^[0-9a-fA-F]{24}$/)) {
      $location.path('/staff/user').replace();
    }
  });

  // TODO Make custom directive to allow filtering of ng-model property so we
  // don't have to do this
  $ctrl.populateUser = function(user) {
    user.createdAt = $filter('date')(user.createdAt);
    user.lastLogin = $filter('date')(user.lastLogin);
    user.invited = $filter('date')(user.invited);

    $scope.user = user;
  };

  $ctrl.init = function() {
    sailsSocket.get('/user/' + $scope.id).then($ctrl.populateUser);
  };

  $ctrl.setLockedStatus = function(updatedUser) {
    $scope.user.isLocked = updatedUser.isLocked;
  };

  $scope.lockUnlock = function() {
    sailsSocket.get('/user/lockUnlock/' + $scope.id).then($ctrl.setLockedStatus);
  };

  $ctrl.getEmailConfirmation = function(response) {
    var message = 'Invite Email Sent.';

    if (response.error) {
      message = response.error;
    } else {
      $scope.user.invited = $filter('date')(response.invited);
    }

    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position('bottom right')
        .hideDelay(3000)
    );
    $scope.emailSending = false;
  };

  $scope.sendInviteEmail = function() {
    $scope.emailSending = true;
    sailsSocket.get('/user/sendInvite/' + $scope.id).then($ctrl.getEmailConfirmation);
  };

  $scope.masquerade = function() {
    var previousUser = $scope.$root.previousUser || {user: $scope.$root.user, ministry: $scope.$root.ministry};

    sailsSocket.post('/session/masquerade', {user: $scope.user, previousUser: previousUser}).then(function () {window.location.reload();});
  };

  $ctrl.init();

}]);
