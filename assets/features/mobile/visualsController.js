angular.module('Bethel.mobile')
.controller('visualsController', ['$scope', 'sailsSocket',
  function ($scope, sailsSocket) {

  $scope.$watch('ministry.description', function(newValue, oldValue) {
    if (newValue === oldValue) return;

    sailsSocket.put('/ministry/' + $scope.ministry.id, { description: newValue });
  });

}]);
