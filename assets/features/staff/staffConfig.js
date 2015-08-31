angular.module('Bethel.staff', ['ui.router'])
.config(['$stateProvider', function ($stateProvider) {

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
      controller: 'staffUserDetailController'
    })
    .state('staff.ministry', {
      url: '/ministry',
      templateUrl: 'features/staff/staffMinistryListView.html',
      controller: 'staffMinistryListController'
    })
    .state('staff.detailedMinistry', {
      url: '/ministry/:ministryId',
      templateUrl: 'features/staff/staffMinistryDetailView.html',
      controller: 'staffMinistryDetailController'
    });

}]);
