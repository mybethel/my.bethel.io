angular.module('Bethel.mobile')
.controller('mobileOverviewController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.userTabs = {
    'visuals': {
      index: 0,
      icon: 'palette',
      label: 'visual appearance'
    },
    'notification': {
      index: 1,
      icon: 'notifications',
      label: 'push notifications'
    },
    'locations': {
      index: 2,
      icon: 'location_on',
      label: 'enabled locations'
    },
    'media': {
      index: 3,
      icon: 'video_library',
      label: 'media player'
    },
    'live': {
      index: 4,
      icon: 'videocam',
      label: 'live stream'
    }
  }

}]);
