angular.module('Bethel.staff', ['ui.router'])
.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('staff', {
      url: '/staff/:page',
      templateUrl: 'features/staff/staffView.html',
      controller: 'staffController',
      data: { pageTitle: 'Staff' }
    })
    .state('staff.detailedUser', {
      url: '/user/:userId',
      templateUrl: 'features/staff/staffUserDetailView.html',
      controller: 'staffUserDetailController'
    })
    .state('staff.detailedMinistry', {
      url: '/ministry/:ministryId',
      templateUrl: 'features/staff/staffMinistryDetailView.html',
      controller: 'staffMinistryDetailController'
    })
    .state('staff.invoice', {
      url: '/invoice',
      templateUrl: 'features/staff/invoiceView.html',
      data: { pageTitle: 'Staff' }
    });

}]);
