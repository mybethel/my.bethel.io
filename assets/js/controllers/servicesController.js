angular.module('Bethel.dashboard')

.controller('ServicesController', function ($rootScope, $scope, $modal) {

  $scope.accounts = [];

  io.socket.get('/service?ministry=' + $rootScope.ministry.id, {}, function (response, status) {
    $scope.$apply(function() { $scope.accounts = response; });
  });

  $scope.serviceConnect = function() {

    $modal.open({
      templateUrl: 'templates/dashboard/services.new.html'
    });

  };

});
