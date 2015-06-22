angular.module('Bethel.staff')

.controller('staffUserListController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', 'sailsSocket', '$mdDialog',
  function ($rootScope, $scope, $stateParams, $state, $location, sailsSocket, $mdDialog) {

  $scope.$parent.tabIndex = 0;

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    $scope.users = sailsSocket.populateMany('/user');

    io.socket.get('/ministry', function (response, status) {
      $scope.$apply(function() {
        $scope.ministries = response;
      });
    });

    io.socket.get('/ministry', function (response, status) {
      $scope.$apply(function() {
        $scope.ministries = response;
      });
    });
  };

  $scope.detailedUserTransition = function(userId) {
    $state.transitionTo('staff.detailedUser', {'userId': userId});
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
    .then(function (newUser) {
      $scope.users.push(newUser);
      $location.path('/staff/user/' + newUser.id).replace();
    });;

  }

  $scope.init();

}]);
