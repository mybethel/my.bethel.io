angular.module('Bethel.mobile', [])

.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('mobile', {
      url: '/mobile',
      templateUrl: 'features/mobile/mobileOverview.html',
      controller: 'mobileOverviewController'
    });

}]);
