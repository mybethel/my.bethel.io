angular.module('Bethel.streaming')
.controller('streamingController', ['$scope', function ($scope) {

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
