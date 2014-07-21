app.controller('AccountsController', function ($scope, sailsSocket, $log, filterFilter) {

  $scope.accounts = [];

  sailsSocket.get('/service/list', {}, function (response, status) {
    $scope.accounts = response;
  });

});