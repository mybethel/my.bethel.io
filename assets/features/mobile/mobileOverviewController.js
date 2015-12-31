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

  $scope.$watch('ministry.mobileEnabled', function(newValue, oldValue) {
    if (newValue === oldValue) return;
    sailsSocket.put('/ministry/' + $scope.ministry.id, { mobileEnabled: newValue });
  }, true);

}]);
