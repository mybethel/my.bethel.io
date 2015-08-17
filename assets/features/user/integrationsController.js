angular.module('Bethel.user')
.controller('integrationsController', ['$scope', '$mdDialog', 'sailsSocket',
  function ($scope, $mdDialog, sailsSocket) {

  $scope.integrations = sailsSocket.populateMany('/service?ministry=' + $scope.$root.ministry.id);
  sailsSocket.sync($scope.integrations, 'service');

}]);
