angular.module('Bethel.user')
.controller('settingsController', ['$scope', '$state', '$stateParams',
  function ($scope, $state, $stateParams) {

  $scope.userTabs = {
    'account': {
      index: 0,
      label: 'my account'
    },
    'locations': {
      index: 1,
      label: 'locations'
    },
    'services': {
      index: 2,
      label: 'connected accounts'
    },
    'billing': {
      index: 3,
      label: 'subscription and billing'
    }
  }

  $scope.currentTab = $scope.userTabs[$stateParams.page].index;

  // Ensure that the location in the address bar is always correct.
  $scope.updateLocation = function(tab) {
    $state.go('settings', { page: tab }, { notify: false });
  };

}]);
