angular.module('Bethel.user', [])

.controller('LoginController', function ($scope, authService) {

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
      if (typeof response.message !== 'undefined' && response.message.error) {
        // Shake the login dialogue to indicate login wasn't successful.
        $('#login-signup').removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass();
        });

        // Set the error scope to associate an error with a field.
        return $scope.$apply(function() { $scope.error = response.message.error; });
      }

      // Confirm that login was sucessful.
      authService.loginConfirmed();
    });
  };

});