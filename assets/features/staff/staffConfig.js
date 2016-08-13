angular.module('Bethel.staff', ['ui.router'])
.config(['$stateProvider', function($stateProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff/:page',
      templateUrl: 'features/staff/staffView.html',
      controller: 'staffController',
      data: { pageTitle: 'Staff' }
    })
    .state('staffViewUser', {
      url: '/staff/user/:userId',
      templateUrl: 'features/staff/staffUserDetailView.html',
      controller: 'staffUserDetailController'
    })
    .state('staffViewMinistry', {
      url: '/staff/ministry/:ministryId',
      templateUrl: 'features/staff/staffMinistryDetailView.html',
      controller: 'staffMinistryDetailController'
    })
    .state('staff.invoice', {
      url: '/invoice',
      templateUrl: 'features/staff/invoiceView.html',
      data: { pageTitle: 'Staff' }
    });

}]);
