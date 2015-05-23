angular.module('Bethel.user', [])

.controller('LoginController', function ($scope, authService) {

  $scope.credentials = {};
  $scope.error = {};

  io.socket.get('/csrfToken', function (response) {
    $scope.credentials._csrf = response._csrf;
  });

  $scope.login = function (credentials) {
    io.socket.post('/session/create', credentials, function (response) {
      if (angular.isDefined(response.error)) {
        // Shake the login dialogue to indicate login wasn't successful.
        $('#login-signup').removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          $(this).removeClass();
        });

        // Set the error scope to associate an error with a field.
        return $scope.$apply(function() { $scope.error = response.error; });
      }

      $scope.$root.$apply(function() {
        $scope.$root.user = response.user;
        $scope.$root.ministry = response.ministry;
      });

      // Confirm that login was sucessful.
      authService.loginConfirmed();
    });
  };

});