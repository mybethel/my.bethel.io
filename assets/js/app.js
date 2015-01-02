/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'http-auth-interceptor',
  'ui.router',
  'ui.bootstrap',
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

.controller('AppCtrl', ['$rootScope', function ($scope) {

  $scope.redirect = '';
  $scope.navLinks = [];
  $scope.user = null;
  $scope.ministry = null;
  $scope.authCheck = false;
  $scope.collapseNav = false;

  $scope.updateSession = function(ev, data) {
    io.socket.get('/session/current', function (response) {
      $scope.$apply(function() {
        $scope.user = response.user;
        $scope.ministry = response.ministry;
        $scope.isAdmin = response.isAdmin;
        $scope.authCheck = true;

        if (response.isAdmin) {
          $scope.navLinks.unshift({ title: 'Staff', icon: 'wrench', url: '/#/staff' });
        }
      });
    });
  };

  // Update current session on load or login.
  $scope.updateSession();
  $scope.$on('event:auth-loginConfirmed', $scope.updateSession);

  io.socket.get('/csrfToken', function (response) {
    $scope._csrf = response._csrf;
  });

  // Main navigation bar links.
  $scope.navLinks.push.apply($scope.navLinks, [
    { title: 'Dashboard', icon: 'tachometer', url: '#/dashboard' },
    { title: 'Podcasting', icon: 'microphone', url: '#/podcast' },
    { title: 'Media', icon: 'youtube-play', url: '#/media' },
    { title: 'Mobile App', icon: 'mobile', url: '#/beta' },
    { title: 'Volunteers', icon: 'users', url: '#/beta' },
    { title: 'Live Streaming', icon: 'video-camera', url: '#/beta' },
    { title: 'Giving', icon: 'money', url: '#/beta' },
    { title: 'Social Media', icon: 'thumbs-up', url: '#/beta' }
  ]);

  $scope.toggleNav = function() {
    $scope.collapseNav = !$scope.collapseNav;
  };

  // Ministry dropdown menu.
  $scope.ministryLinks = [
    { title: 'Connected Accounts', url: '/#/dashboard/accounts' },
    { title: 'Settings', url: '/ministry/edit' },
    { title: 'Locations', url: '/#/dashboard/locations' }
  ];
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
