/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'http-auth-interceptor',
  'ngMaterial',
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
  'ui.utils'
])

.config(function ($urlRouterProvider, $translateProvider, $mdThemingProvider) {

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/i18n/{part}/{lang}.json'
  });

  $urlRouterProvider.otherwise('/dashboard');

  $mdThemingProvider.definePalette('brandBlue', $mdThemingProvider.extendPalette('blue', {
    '500': '1591b5'
  }));

  $mdThemingProvider.theme('default')
    .primaryPalette('brandBlue')
    .accentPalette('blue-grey');

})

.controller('AppCtrl', ['$rootScope', '$state', function ($scope, $state) {

  $scope.redirect = '';
  $scope.navLinks = [
    { title: 'Dashboard', icon: 'tachometer', url: 'dashboard' },
    { title: 'Podcasting', icon: 'microphone', url: 'podcast' },
    { title: 'Media', icon: 'youtube-play', url: 'media' },
    { title: 'Mobile App', icon: 'mobile', url: 'beta' },
    { title: 'Volunteers', icon: 'users', url: 'beta' },
    { title: 'Live Streaming', icon: 'video-camera', url: 'streaming' },
    { title: 'Giving', icon: 'money', url: 'beta' },
    { title: 'Social Media', icon: 'thumbs-up', url: 'beta' }
  ];
  $scope.user = null;
  $scope.ministry = null;
  $scope.authCheck = false;
  $scope.collapseNav = false;

  $scope.nav = $state.go;

  $scope.updateSession = function(ev, data) {
    io.socket.get('/session/current', function (response) {
      $scope.$apply(function() {
        $scope.user = response.user;
        $scope.ministry = response.ministry;
        $scope.isAdmin = response.isAdmin;
        $scope.authCheck = true;

        if (response.isAdmin) {
          $scope.navLinks.unshift({ title: 'Staff', icon: 'wrench', url: 'staff.users' });
        }

        if ($state.current.name === '' && angular.isDefined(response.user)) {
          $state.transitionTo('dashboard');
        }
      });
    });
  };

  $scope.updateCsrf = function() {
    io.socket.get('/csrfToken', function (response) {
      $scope.$apply(function() {
        $scope._csrf = response._csrf;
      });
    });
  };

  // Update current session on load or login.
  $scope.updateSession();
  $scope.updateCsrf();
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
