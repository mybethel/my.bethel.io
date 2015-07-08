angular.module('Bethel.user', [])
.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('settings', {
      url: '/settings',
      templateUrl: 'features/user/userSettingsView.html',
      controller: 'userSettingsController'
    });

}]);
