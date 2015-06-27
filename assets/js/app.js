/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'http-auth-interceptor',
  'ngMaterial',
  'ngMessages',
  'ui.router',
  'angulartics',
  'angulartics.google.analytics',
  'angularMoment',
  'pascalprecht.translate',
  'Bethel.user',
  'Bethel.dashboard',
  'Bethel.media',
  'Bethel.podcast',
  'Bethel.staff',
  'Bethel.streaming',
  'Bethel.util',
  'ui.utils'
])

.config(function ($urlRouterProvider, $translateProvider, $mdThemingProvider) {

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/i18n/{part}/{lang}.json'
  });

  $urlRouterProvider.otherwise('/dashboard');

  $mdThemingProvider.definePalette('brandBlue', $mdThemingProvider.extendPalette('blue', {
    '500': '1591b5',
    '800': '106982'
  }));

  $mdThemingProvider.theme('default')
    .primaryPalette('brandBlue')
    .accentPalette('blue-grey');

})

.run(function() {
  videojs.options.flash.swf = "https://static.bethel.io/libraries/video-js/video-js.swf";
})

.controller('AppCtrl', ['$rootScope', '$state', 'sailsSocket', function ($scope, $state, sailsSocket) {

  $scope.redirect = '';
  $scope.navLinks = [
    { title: 'Dashboard', icon: 'dashboard', url: 'dashboard' },
    { title: 'Podcasting', icon: 'mic', url: 'podcast' },
    { title: 'Media', icon: 'play_circle_filled', url: 'media' },
    { title: 'Mobile App', icon: 'phone_iphone', url: 'beta' },
    { title: 'Volunteers', icon: 'people', url: 'beta' },
    { title: 'Live Streaming', icon: 'videocam', url: 'streaming' },
    { title: 'Giving', icon: 'attach_money', url: 'beta' },
    { title: 'Social Media', icon: 'thumb_up', url: 'beta' },
    { title: 'Settings', icon: 'settings', url: 'settings' }
  ];
  $scope.user = null;
  $scope.ministry = null;
  $scope.authCheck = false;
  $scope.collapseNav = false;

  $scope.nav = $state.go;

  $scope.updateSession = function(ev, data) {
    sailsSocket.get('/session/current').then(function (response) {
      $scope.authCheck = true;
      if (response.auth) return;

      $scope.user = response.user;
      $scope.ministry = response.ministry;
      $scope.isAdmin = response.isAdmin;

      if (response.isAdmin) {
        $scope.navLinks.unshift({ title: 'Staff', icon: 'verified_user', url: 'staff.users' });
      }
    });
  };

  $scope.updateCsrf = function() {
    sailsSocket.get('/csrfToken').then(function (response) {
      $scope._csrf = response._csrf;
    });
  };

  // Update current session on load or login.
  $scope.updateSession();
  $scope.$on('event:auth-loginConfirmed', $scope.updateSession);
  $scope.$on('$stateChangeSuccess', $scope.updateCsrf);

  $scope.toggleNav = function() {
    $scope.collapseNav = !$scope.collapseNav;
  };

}]);

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function findIndexByPropertyValue(arr, property, value) {
  var index = null;
  for (var i in arr) {
    if (arr[i][property] == value) {
      index = i;
      break;
    }
  }
  return index;
}
