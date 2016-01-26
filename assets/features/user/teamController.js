angular.module('Bethel.user').controller('teamController', TeamController);

function TeamController($scope, sailsSocket) {

  $scope.team = sailsSocket.populateMany('ministry/team');

}

TeamController.$inject = ['$scope', 'sailsSocket'];
