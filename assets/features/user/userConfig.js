angular.module('Bethel.user', ['uiGmapgoogle-maps'])
.config(['$stateProvider', 'uiGmapGoogleMapApiProvider',
  function ($stateProvider, GoogleMapApiProviders) {

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'features/user/dashboardView.html'
    })
    .state('settings', {
      url: '/settings/:page',
      templateUrl: 'features/user/settingsView.html',
      controller: 'settingsController'
    })
    .state('beta', {
      url: '/beta',
      templateUrl: 'features/user/betaView.html'
    });

  GoogleMapApiProviders.configure({
    key: 'AIzaSyCasoNnO-7ZHrH_NBcCU_BBed6duq8NvJg',
    v: '3.17',
    libraries: 'places'
  });

}]);
