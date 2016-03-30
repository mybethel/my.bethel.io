
/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
angular.module('Bethel', [
  'bethel.ui',
  'Bethel.util',
  'Bethel.user',
  'Bethel.podcast',
  'Bethel.staff',
  'Bethel.streaming'
])

.config(['$urlRouterProvider', '$translateProvider', '$compileProvider', 'sailsSocketProvider',
  function ($urlRouterProvider, $translateProvider, $compileProvider, sailsSocketProvider) {

  $translateProvider.preferredLanguage('en');
  $translateProvider.useLoader('$translatePartialLoader', {
    urlTemplate: '/i18n/{part}/{lang}.json'
  });

  sailsSocketProvider.config.transports = ['websocket'];

  if (!window.__minimal && !window.__anonymous)
    $urlRouterProvider.otherwise('/dashboard');

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto):/);

}])

.run(function() {
  videojs.options.flash.swf = 'https://static.bethel.io/libraries/video-js/video-js.swf';
})

.controller('AppCtrl', ['$rootScope', '$state', 'sailsSocket', '$mdToast', 'notifyService', function ($scope, $state, sailsSocket, $mdToast, notifyService) {

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
      $scope.previousUser = response.previousUser;

      if ($scope.user.ministriesAuthorized && $scope.user.ministriesAuthorized.length > 0) {
        $scope.$root.authorized = sailsSocket.populateMany('session/authorized');
      }

      notifyService.beforeNotify = function () {
        return !$scope.previousUser;
      };

      if (response.isAdmin && $scope.navLinks[0].title !== 'Staff') {
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

  $scope.$watch('previousUser', function (newValue) {
    if (!newValue) return;

    var toast = $mdToast.simple()
      .content('Masquerading as ' + $scope.user.name + ' from ' + $scope.ministry.name)
      .action('End')
      .highlightAction(false)
      .hideDelay(false)
      .position('bottom right');

    $mdToast.show(toast).then(function (response) {
      console.log('action ', response);
      if (response !== 'ok') return;
      sailsSocket.post('/session/masquerade', $scope.previousUser).then(function () {
        window.location.reload();
      });
    });

  });

  $scope.$on('$locationChangeStart', function(event, newUrl) {
    delete $scope.navActive;
    for (var i = 0; i < $scope.navLinks.length; i++) {
      if ($scope.navLinks[i].url === 'beta') {
        continue;
      }
      if (newUrl.indexOf($scope.navLinks[i].url) !== -1) {
        $scope.navActive = $scope.navLinks[i].url;
        break;
      }
    }
  });

}]);

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
