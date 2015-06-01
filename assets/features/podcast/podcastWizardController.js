angular.module('Bethel.podcast')

.controller('podcastWizardController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

}]);
