/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'http-auth-interceptor',
  'ui.router',
  'angulartics',
  'angulartics.google.analytics',
  'angularMoment',
  'pascalprecht.translate',
  'Bethel.user',
  'Bethel.dashboard',
  'Bethel.media',
  'Bethel.podcast',
  'Bethel.staff'
])

.config(function ($urlRouterProvider, $translateProvider) {

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/i18n/{part}/{lang}.json'
  });

  $urlRouterProvider.otherwise('/dashboard');

})

.filter('trustAsHtml', function($sce) { return $sce.trustAsHtml; })

.controller('AppCtrl', function ($rootScope, $scope, $log, $state, filterFilter) {

  $scope.redirect = '';
  $scope.navLinks = [];
  $rootScope.user = null;
  $rootScope.ministry = null;
  $rootScope.authCheck = false;

  $scope.updateSession = function(ev, data) {
    io.socket.get('/session/current', function (response) {
      $rootScope.$apply(function() {
        $rootScope.user = response.user;
        $rootScope.ministry = response.ministry;
        $rootScope.isAdmin = response.isAdmin;
        $rootScope.authCheck = true;

        if (response.isAdmin) {
          $scope.navLinks.unshift({ title: 'Staff', icon: 'wrench', url: '/#/staff' });
        }
      });
    });
  };

  // Update current session on load or login.
  $scope.updateSession();
  $scope.$on('sailsSocket:connect', $scope.updateSession);
  $scope.$on('event:auth-loginConfirmed', $scope.updateSession);

  io.socket.get('/csrfToken', function (response) {
    $rootScope._csrf = response._csrf;
  });

  // Main navigation bar links.
  $scope.navLinks.push.apply($scope.navLinks, [
    { title: 'Dashboard', icon: 'tachometer', url: '#/dashboard' },
    { title: 'Podcasting', icon: 'microphone', url: '#/podcast' },
    { title: 'Media', icon: 'youtube-play', url: '#/media' },
    { title: 'Mobile App', icon: 'mobile', url: '/mobile' },
    { title: 'Volunteers', icon: 'users', url: '/' },
    { title: 'Live Streaming', icon: 'video-camera', url: '/' },
    { title: 'Giving', icon: 'money', url: '/' },
    { title: 'Social Media', icon: 'thumbs-up', url: '/' }
  ]);

  // Ministry dropdown menu.
  $scope.ministryLinks = [
    { title: 'Connected Accounts', url: '/#/dashboard/accounts' },
    { title: 'Settings', url: '/ministry/edit' },
    { title: 'Locations', url: '/#/dashboard/locations' }
  ];
});

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
