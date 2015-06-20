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
      controller: 'staffUserCreateController'
    })
    .then(function (data) {
      console.log('DATA ', data);
      // $scope.ministries.push(data)
    });;

  }

  $scope.init();

}]);
