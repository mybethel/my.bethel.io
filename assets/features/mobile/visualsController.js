angular.module('Bethel.mobile')
.controller('visualsController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.$watch('ministry.description', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { description: newValue });
  });

  $scope.$watch('ministry.subtitle', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { subtitle: newValue });
  });

  $scope.$watch('ministry.color', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { color: newValue });
  }, true);

}]);
