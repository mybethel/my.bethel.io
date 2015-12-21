angular.module('Bethel.mobile')
.controller('mobileOverviewController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.userTabs = {
    'visuals': {
      index: 0,
      icon: 'palette',
      label: 'visual appearance'
    },
    'media': {
      index: 1,
      icon: 'video_library',
      label: 'media player'
    },
    'notification': {
      index: 2,
      icon: 'notifications',
      label: 'push notifications'
    }
  }

}]);
