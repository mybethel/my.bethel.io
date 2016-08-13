angular.module('Bethel.user')
.controller('LoginController', ['$scope', 'authService', 'sailsSocket', function($scope, authService, sailsSocket) {

  $scope.invitedUser = {};
  $scope.newSignup = {};

  $scope.login = function(credentials) {
    sailsSocket.post('/session/create', credentials).then(function(response) {
      $scope.$root.user = response.user;
      $scope.$root.ministry = response.ministry;

      // Confirm that login was sucessful.
      authService.loginConfirmed();
    }, function(error) {
      angular.element(document.querySelector('#login-signup'))
        .addClass('shake animated')
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
          angular.element(this).removeClass('shake animated');
        });

      // Set the error scope to associate an error with a field.
      return $scope.error = error;
    });
  };

  $scope.submitInvite = function(invitedUser) {

    sailsSocket.post('/session/create', { name: invitedUser.email, pass: invitedUser.inviteCode }).then(function() {

      sailsSocket.put('/user/' + invitedUser.id, invitedUser).then(function() {
        window.location.replace('/#/dasboard');
      });

    });

  };

  $scope.signup = function(newSignup) {
    sailsSocket.post('/user', newSignup).then(function(response) {
      console.log('post res ', response);
      // Hit send email api route
    }).catch(function(err) {
      if (err.invalidAttributes.email[0].rule === 'unique') {
        $scope.userSignupForm.email.$setValidity('unique', false);
      } else {
        $scope.userSignupForm.email.$setValidity('generic', false);
      }
    });
  };

  $scope.$watch('newSignup.email', function() {
    $scope.userSignupForm.email.$setValidity('unique', true);
    $scope.userSignupForm.email.$setValidity('generic', true);
  });

  $scope.$watch('error', function(error) {
    if (!error) return;
    $scope.userLoginForm.email.$setValidity('loginValid', !error.name);
    $scope.userLoginForm.password.$setValidity('loginValid', !error.pass);
  });

}]);
