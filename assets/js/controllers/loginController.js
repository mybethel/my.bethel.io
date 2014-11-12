app.controller('LoginController', function ($scope, $log, $state, filterFilter, authService) {

  $scope.credentials = {
    name: '',
    pass: '',
    _csrf: ''
  };

  $scope.error = {};

  io.socket.get('/csrfToken', function (response) {
    $scope.credentials._csrf = response._csrf;
  });

  $scope.login = function (credentials) {
    io.socket.post('/session/create', credentials, function (response) {
      $scope.error = response.error;

      if (!response.error) {
        authService.loginConfirmed();
      } else {
        $('#login-signup-wrapper').removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass();
        });
      }
    });
  };

});