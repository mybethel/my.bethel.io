angular.module('Bethel.user')
.controller('LoginController', ['$scope', 'authService', 'sailsSocket', function ($scope, authService, sailsSocket) {

  $scope.invitedUser = {};

  $scope.login = function (credentials) {
    sailsSocket.post('/session/create', credentials).then(function (response) {
      $scope.$root.user = response.user;
      $scope.$root.ministry = response.ministry;

      // Confirm that login was sucessful.
      authService.loginConfirmed();
    }, function(response) {
      angular.element(document.querySelector('#login-signup'))
        .addClass('shake animated')
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          angular.element(this).removeClass('shake animated');
        });

      if (!response.error) return;
      $scope.userLoginForm.email.$setValidity('loginValid', !response.error.name);
      $scope.userLoginForm.password.$setValidity('loginValid', !response.error.pass);
    });
  };

  $scope.signup = function (invitedUser) {

    sailsSocket.post('/session/create', { name: invitedUser.email, pass: invitedUser.inviteCode }).then(function() {

      sailsSocket.put('/user/' + invitedUser.id, invitedUser).then(function() {
        window.location.replace('/#/dasboard');
      });

    });

  };

  // Reset the validity of the password field on a re-attempt.
  $scope.$watch('credentials.pass', function() {
    $scope.userLoginForm.password.$setValidity('loginValid', true);
  });

}]);
