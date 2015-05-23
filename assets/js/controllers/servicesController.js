angular.module('Bethel.dashboard')

.controller('ServicesController', function ($scope, $modal) {

  $scope.accounts = [];

  io.socket.get('/service?ministry=' + $scope.$root.ministry.id, function (response) {
    $scope.$apply(function() { $scope.accounts = response; });
  });

  $scope.serviceConnect = function() {

    $modal.open({
      templateUrl: 'templates/dashboard/services.new.html'
    });

  };

});
