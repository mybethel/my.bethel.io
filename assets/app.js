/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'Bethel.util',
  'Bethel.user',
  'Bethel.podcast',
  'Bethel.staff',
  'Bethel.streaming'
])

.config(['$urlRouterProvider', '$translateProvider', '$mdThemingProvider', function ($urlRouterProvider, $translateProvider, $mdThemingProvider) {

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/i18n/{part}/{lang}.json'
  });

  $mdThemingProvider.definePalette('brandBlue', $mdThemingProvider.extendPalette('blue', {
    '500': '1591b5',
    '800': '106982'
  }));

  if (!window.__minimal && !window.__anonymous)
    $urlRouterProvider.otherwise('/dashboard');

  $mdThemingProvider.theme('default')
    .primaryPalette('brandBlue')
    .accentPalette('blue-grey');

}])

.run(function() {
  videojs.options.flash.swf = 'https://static.bethel.io/libraries/video-js/video-js.swf';
})

.controller('AppCtrl', ['$rootScope', '$state', 'sailsSocket', function ($scope, $state, sailsSocket) {

  if (window.__minimal) return;

  $scope.redirect = '';
  $scope.navLinks = [
    { title: 'Dashboard', icon: 'dashboard', url: 'dashboard' },
    { title: 'Podcasting', icon: 'mic', url: 'podcast' },
    { title: 'Media', icon: 'play_circle_filled', url: 'beta' },
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

  $scope.updateSession = function() {
    sailsSocket.get('/session/current').then(function (response) {
      $scope.authCheck = true;
      $scope.user = response.user;
      $scope.ministry = response.ministry;
      $scope.isAdmin = response.isAdmin;
      $scope.isMasquerading = response.isMasquerading;

      if (response.isAdmin) {
        $scope.navLinks.unshift({ title: 'Staff', icon: 'verified_user', url: 'staff.users' });
      }
    }, function() {
      $scope.authCheck = true;
    });
  };

  // Update current session on load or login.
  $scope.updateSession();
  $scope.$on('event:auth-loginConfirmed', $scope.updateSession);

  $scope.toggleNav = function() {
    $scope.collapseNav = !$scope.collapseNav;
  };

  $scope.endMasquerade = function() {
    var previousSession = $scope.isMasquerading;
    previousSession.isMasquerading = false;

    sailsSocket.post('/session/masquerade', previousSession).then(function () {
      $scope.user = previousSession.user;
      $scope.ministry = previousSession.ministry;
      $scope.isMasquerading = null;
    });
  };

}]);

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
