'use strict';

/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
var app = angular.module('Bethel', [
  'http-auth-interceptor',
  'sails.io',
  'ui.router',
  'Bethel.dashboard',
  'Bethel.media',
  'Bethel.podcast',
  'Bethel.staff'
])

.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/dashboard');

})

.controller('AppCtrl', function ($rootScope, $scope, sailsSocket, $log, $state, filterFilter) {

  $scope.redirect = '';
  $scope.navLinks = [];
  $rootScope.user = null;
  $rootScope.ministry = null;
  $rootScope.authCheck = false;

  $scope.updateSession = function(ev, data) {
    sailsSocket.get('/session/current', {}, function (response, status) {
      $rootScope.user = response.user;
      $rootScope.ministry = response.ministry;
      $rootScope.isAdmin = response.isAdmin;
      $rootScope.authCheck = true;

      if ($rootScope.isAdmin) {
        $scope.navLinks.unshift({ title: 'Staff', icon: 'wrench', url: '/#/staff' });
      }
    });
  };

  // Update current session on load or login.
  $scope.$on('sailsSocket:connect', $scope.updateSession);
  $scope.$on('event:auth-loginConfirmed', $scope.updateSession);

  // Main navigation bar links.
  $scope.navLinks.push.apply($scope.navLinks, [
    { title: 'Dashboard', icon: 'tachometer', url: '/' },
    { title: 'Podcasting', icon: 'microphone', url: '/#/podcasts' },
    { title: 'Media', icon: 'youtube-play', url: '/#/media' },
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
