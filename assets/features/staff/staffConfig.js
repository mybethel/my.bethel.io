angular.module('Bethel.staff', ['ui.router', 'ngSanitize', 'ui.select'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff',
      templateUrl: 'features/staff/staffView.html',
      controller: 'StaffController'
    })
    .state('staff.users', {
      url: '/user',
      templateUrl: 'features/staff/staffUserListView.html',
      controller: 'UserListController'
    })
    .state('staff.detailedUser', {
      url: '/user/:userId',
      templateUrl: 'features/staff/staffUserDetailView.html',
      controller: 'UserManagementController'
    })
    .state('staff.userCreate', {
      url: '/createUser',
      templateUrl: 'features/staff/staffUserCreateView.html',
      controller: 'UserManagementController'
    })
    .state('staff.ministries', {
      url: '/ministries',
      templateUrl: 'features/staff/staffMinistryListView.html',
      controller: 'MinistryListController'
    })
    .state('staff.detailedMinistry', {
      url: '/ministry/:ministryId',
      templateUrl: 'features/staff/staffMinistryDetailView.html',
      controller: 'MinistryManagementController'
    });

});
