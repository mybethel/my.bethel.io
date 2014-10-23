angular.module('Bethel.media', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('media', {
      url: '/media',
      templateUrl: 'templates/media/index.html',
      controller: 'MediaListCtrl'
    });

})

.controller('MediaListCtrl', function ($scope, sailsSocket, $log, filterFilter) {

});