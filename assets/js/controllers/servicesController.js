angular.module('Bethel.dashboard')

.controller('ServicesController', function ($scope, $modal) {

  $scope.accounts = [];

  io.socket.get('/service/list', {}, function (response, status) {
    $scope.$apply(function() { $scope.accounts = response; });
  });

  $scope.serviceConnect = function() {

    $modal.open({
      templateUrl: 'templates/dashboard/services.new.html'
    });

  };

});
