angular.module('Bethel.streaming').controller('streamingDetailController', StreamingDetailController);

function StreamingDetailController($scope, $mdDialog, streamingDay) {

  this.days = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  };

  $scope.day = this.days[streamingDay];

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}

StreamingDetailController.$inject = ['$scope', '$mdDialog', 'streamingDay'];
