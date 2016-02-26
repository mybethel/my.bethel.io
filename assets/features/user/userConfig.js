angular.module('Bethel.user', ['uiGmapgoogle-maps'])
.config(['$stateProvider', 'uiGmapGoogleMapApiProvider',
  function ($stateProvider, GoogleMapApiProviders) {

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'features/user/dashboardView.html',
      data : { pageTitle: 'Dashboard' }
    })
    .state('settings', {
      url: '/settings/:page',
      templateUrl: 'features/user/settingsView.html',
      controller: 'settingsController',
      data : { pageTitle: 'Settings' }
    })
    .state('beta', {
      url: '/beta',
      templateUrl: 'features/user/betaView.html',
      data : { pageTitle: 'Feature in Beta' }
    });

  GoogleMapApiProviders.configure({
    key: 'AIzaSyCasoNnO-7ZHrH_NBcCU_BBed6duq8NvJg',
    v: '3.17',
    libraries: 'places'
  });

}]);
