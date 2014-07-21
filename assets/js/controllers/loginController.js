app.controller('LoginController', function ($scope, sailsSocket, $log, $state, filterFilter, authService) {

  $scope.credentials = {
    name: '',
    pass: '',
    _csrf: ''
  };

  $scope.error = {};

  if ($scope.$parent.user.id) {
    $state.go('dashboard');
  } 

  sailsSocket.get('/csrfToken', {}, function (response, status) {
    if (!response.error)
      $scope.credentials._csrf = response._csrf;
  });

  $scope.login = function (credentials) {
    sailsSocket.post('/session/create', credentials, function (response) {
      $scope.error = response.error;

      if (!response.error) {
        authService.loginConfirmed();
      } else {
        $('#login-signup-wrapper').removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass();
        });
      }
    });
  }

});