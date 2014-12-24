angular.module('Bethel.dashboard')

.controller('ServicesController', function ($scope) {

  $scope.accounts = [];

  io.socket.get('/service/list', {}, function (response, status) {
    $scope.$apply(function() { $scope.accounts = response; });
  });

});
