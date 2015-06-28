angular.module('Bethel.staff')

.controller('staffUserListController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', 'sailsSocket', '$mdDialog',
  function ($rootScope, $scope, $stateParams, $state, $location, sailsSocket, $mdDialog) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 0;

  $ctrl.populateUsers = function (response, status) {
    $scope.users = response;
    $scope.orderByField = 'name';
  }

  $ctrl.populateMinistries = function (response, status) {
    $scope.ministries = response;
  }

  $socket.get('/user').then($ctrl.populateUsers);
  $socket.get('/ministry').then($ctrl.populateMinistries);

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
  };

  $scope.showCreateUser = function(event) {

    $mdDialog.show({
      clickOutsideToClose: true,
      focusOnOpen: false,
      templateUrl: 'features/staff/staffUserCreateView.html',
      targetEvent: event,
      locals: {ministries: $scope.ministries},
      controller: 'staffUserCreateController'
    })
    .then(function (newUser) {
      $scope.users.push(newUser);
      $location.path('/staff/user/' + newUser.id).replace();
    });

  }

}]);
