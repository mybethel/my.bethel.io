angular.module('Bethel.streaming').controller('streamingController', StreamingController);

function StreamingController($scope, $mdDialog, sailsSocket, notifyService) {

  $scope.streamingEnabled = $scope.ministry.streaming || {
    mon: { enabled: false },
    tue: { enabled: false },
    wed: { enabled: false },
    thu: { enabled: false },
    fri: { enabled: false },
    sat: { enabled: true },
    sun: { enabled: true }
  };

  $scope.$watch('streamingEnabled', function(newValue, oldValue) {
    if (!newValue || newValue === oldValue) return;
    sailsSocket.put('/ministry/' + $scope.ministry.id, { streaming: newValue }).then(function () {
      notifyService.showCommon('saved');
    });
  }, true);

  $scope.configure = function(event, day) {
    $mdDialog.show({
      clickOutsideToClose: true,
      templateUrl: 'features/streaming/streamingDetailView.html',
      targetEvent: event,
      locals: { streamingDay: day },
      controller: 'streamingDetailController'
    });
  }

}

StreamingController.$inject = ['$scope', '$mdDialog', 'sailsSocket', 'notifyService'];
