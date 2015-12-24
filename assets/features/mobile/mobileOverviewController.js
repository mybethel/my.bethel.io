angular.module('Bethel.mobile')
.controller('mobileOverviewController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.section = 'visuals';

  $scope.toggleSection = function(section) {
    if ($scope.section == section) {
      $scope.section = 'none';
      return;
    }
    $scope.section = section;
  };

}]);
