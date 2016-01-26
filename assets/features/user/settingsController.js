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
    'team': {
      index: 2,
      label: 'my team'
    },
    'integrations': {
      index: 3,
      label: 'integrations'
    },
    'billing': {
      index: 4,
      label: 'subscription and billing'
    }
  };

  if ($stateParams.page)
    $scope.currentTab = $scope.userTabs[$stateParams.page].index;

  // Ensure that the location in the address bar is always correct.
  $scope.updateLocation = function(tab) {
    $state.go('settings', { page: tab }, { notify: false });
  };

}]);
