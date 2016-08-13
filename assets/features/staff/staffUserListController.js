angular.module('Bethel.staff')
.controller('staffUserListController', StaffUserListController);

function StaffUserListController($scope, $state, $location, sailsSocket, $mdDialog) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 0;
  $scope.orderByField = 'name';

  $ctrl.init = function() {
    $scope.users = sailsSocket.populateMany('/user');
    $scope.ministries = sailsSocket.populateMany('/ministry');
  };

  $scope.detailedUserTransition = function(userId) {
    $state.go('staffViewUser', { userId: userId });
  };

  $scope.showCreateUser = function(event) {

    $mdDialog.show({
      clickOutsideToClose: true,
      focusOnOpen: false,
      templateUrl: 'features/staff/staffUserCreateView.html',
      targetEvent: event,
      locals: { ministries: $scope.ministries },
      controller: 'staffUserCreateController'
    })
    .then(function(newUser) {
      $scope.users.push(newUser);
      $location.path('/staff/user/' + newUser.id).replace();
    });

  };

  $ctrl.init();

}

StaffUserListController.$inject = ['$scope', '$state', '$location', 'sailsSocket', '$mdDialog'];
