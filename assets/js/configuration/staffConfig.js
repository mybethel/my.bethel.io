angular.module('Bethel.staff', ['ui.router', 'ngSanitize', 'ui.select'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff',
      templateUrl: 'templates/staff/index.html',
      controller: 'StaffController'
    })
    .state('staff.users', {
      url: '/user',
      templateUrl: 'templates/userManagement/index.html',
      controller: 'UserListController'
    })
    .state('staff.detailedUser', {
      url: '/user/:userId',
      templateUrl: 'templates/userManagement/view.html',
      controller: 'UserManagementController'
    })
    .state('userCreate', {
      url: '/createUser',
      templateUrl: 'templates/userManagement/create.html',
      controller: 'UserManagementController'
    })
    .state('staff.ministries', {
      url: '/ministries',
      templateUrl: 'templates/ministryManagement/index.html',
      controller: 'MinistryListController'
    })
    .state('staff.detailedMinistry', {
      url: '/ministry/:ministryId',
      templateUrl: 'templates/ministryManagement/view.html',
      controller: 'MinistryManagementController'
    });

});
