angular.module('Bethel.user')
.controller('LoginController', function ($scope, authService) {

  $scope.invitedUser = {};

  $scope.login = function (credentials) {
    credentials._csrf = $scope.$root._csrf;
    io.socket.post('/session/create', credentials, function (response) {
      if (angular.isDefined(response.error)) {
        // Shake the login dialogue to indicate login wasn't successful.
        angular.element(document.querySelector('#login-signup'))
          .addClass('shake animated')
          .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            angular.element(this).removeClass('shake animated');
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

  $scope.signup = function (invitedUser) {

    io.socket.post('/session/create', {name: invitedUser.email, pass: invitedUser.inviteCode, _csrf: $scope.$root._csrf}, function (response) {

      invitedUser._csrf = $scope.$root._csrf;
      io.socket.put('/user/' + invitedUser.id, invitedUser, function (response) {
        window.location.replace('/#/dasboard');
      });

    });

  };

  $scope.$watch('error', function (error) {
    if (!error) return;
    $scope.userLoginForm.email.$setValidity('loginValid', !error.name);
    $scope.userLoginForm.password.$setValidity('loginValid', !error.pass);
  });

});
