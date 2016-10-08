angular.module('Bethel.user')
.controller('LoginController', ['$scope', 'authService', 'sailsSocket', '$mdToast', function($scope, authService, sailsSocket, $mdToast) {

  $scope.invitedUser = {};
  $scope.registeringUser = {};
  $scope.newSignup = {};
  var $ctrl = this;

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

  $scope.submitRegistration = function(newUser) {
    console.log('newUser ', newUser);
    sailsSocket.post('/session/create', { name: newUser.email, pass: newUser.registerCode }).then(function() {
      sailsSocket.put('/user/' + newUser.id, newUser).then(function() {
        window.location.replace('/#/dasboard');
      });
    });

  };

  $scope.signup = function(newSignup) {
    $scope.emailSending = true;
    sailsSocket.post('/user', newSignup).then(function(response) {
      console.log('post res ', response);
      // Hit send email api route
      sailsSocket.get('/user/sendRegistration/' + response.id).then($ctrl.signupEmailConfirmation, $ctrl.signupEmailConfirmation);
    }).catch(function(err) {
      $scope.emailSending = false;
      if (err.invalidAttributes.email[0].rule === 'unique') {
        $scope.userSignupForm.email.$setValidity('unique', false);
      } else {
        $scope.userSignupForm.email.$setValidity('generic', false);
      }
    });
  };

  $ctrl.signupEmailConfirmation = function(response) {
    var message = 'Confirmation Email Sent.';
    if (response.error) {
      message = 'Error: ' + response.error;
    }

    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position('bottom right')
        .hideDelay(3000)
    );
    $scope.emailSending = false;
  };

  $scope.$watch('newSignup.email', function() {
    if (!$scope.userSignupForm) return;
    $scope.userSignupForm.email.$setValidity('unique', true);
    $scope.userSignupForm.email.$setValidity('generic', true);
  });

  $scope.$watch('error', function(error) {
    if (!error) return;
    $scope.userLoginForm.email.$setValidity('loginValid', !error.name);
    $scope.userLoginForm.password.$setValidity('loginValid', !error.pass);
  });

}]);
