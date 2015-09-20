angular.module('Bethel.mobile')
.controller('liveController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.streamingEnabled = {
    mon: { enabled: false },
    tue: { enabled: false },
    wed: { enabled: false },
    thu: { enabled: false },
    fri: { enabled: false },
    sat: { enabled: true },
    sun: { enabled: true }
  };

}]);
