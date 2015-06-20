angular.module('Bethel.staff', ['ui.router', 'ngSanitize', 'ui.select'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff',
      templateUrl: 'features/staff/staffView.html',
      controller: 'staffController'
    })
    .state('staff.users', {
      url: '/user',
      templateUrl: 'features/staff/staffUserListView.html',
      controller: 'staffUserListController'
    })
    .state('staff.detailedUser', {
      url: '/user/:userId',
      templateUrl: 'features/staff/staffUserDetailView.html',
      controller: 'staffUserManagementController'
    })
    .state('staff.ministries', {
      url: '/ministries',
      templateUrl: 'features/staff/staffMinistryListView.html',
      controller: 'staffMinistryListController'
    })
    .state('staff.detailedMinistry', {
      url: '/ministry/:ministryId',
      templateUrl: 'features/staff/staffMinistryDetailView.html',
      controller: 'staffMinistryManagementController'
    });

});
