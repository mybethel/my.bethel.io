app.controller('LoginController', function ($scope, sailsSocket, $log, $state, filterFilter, authService) {

  $scope.credentials = {
    name: '',
    pass: '',
    _csrf: ''
  };

  $scope.error = {};

  sailsSocket.get('/csrfToken', {}, function (response, status) {
    if (!response.error)
      $scope.credentials._csrf = response._csrf;
  });

  $scope.login = function (credentials) {
    sailsSocket.post('/session/create', credentials, function (response) {
      console.log(response);
      $scope.error = response.error;

      if (!response.error) {
        authService.loginConfirmed();
      }
    });
  }

});