angular.module('Bethel.staff')
.controller('staffController', StaffController);

function StaffController($location, $scope, $state, $stateParams) {
  var $ctrl = this;

  $scope.staffTabs = {
    users: {
      index: 0,
      label: 'people'
    },
    ministry: {
      index: 1,
      label: 'ministries'
    }
  };

  if ($stateParams && $stateParams.page)
    $scope.currentTab = $scope.staffTabs[$stateParams.page].index;

  // Ensure that the location in the address bar is always correct.
  $scope.updateLocation = function(tab) {
    $state.go('staff', { page: tab }, { notify: false });
  };

  $scope.$root.$watch('isAdmin', function() {
    if (angular.isDefined($scope.$root.isAdmin) && $scope.$root.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $ctrl.init = function() {
    if ($location.path() === '/staff') {
      $location.path('/staff/user').replace();
    }
  };

  $ctrl.init();
}

StaffController.$inject = ['$location', '$scope', '$state', '$stateParams'];
