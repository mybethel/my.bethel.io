angular.module('Bethel.mobile')
.controller('visualsController', ['$scope', 'sailsSocket', '$mdDialog',
  function ($scope, sailsSocket, $mdDialog) {


  $scope.enhancedIcon = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      targetEvent: event,
      templateUrl: 'features/mobile/enhancedIconView.html',
      controller: IconController
    }).then(function(answer) {
      $scope.ministry.enhanced = true;
    }, function() {
      $scope.ministry.enhanced = false;
    });
  }

  function IconController($scope, $mdDialog) {
    $scope.close = function() {
      $mdDialog.cancel();
    };
    $scope.contactMe = function() {
      $mdDialog.hide(true);
    };
  }

  IconController.$inject = ['$scope', '$mdDialog'];

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
