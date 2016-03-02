angular.module('Bethel.user')
.controller('LoginController', ['$scope', 'authService', 'sailsSocket', function ($scope, authService, sailsSocket) {

  $scope.invitedUser = {};

  $scope.signup = function (invitedUser) {

    sailsSocket.post('/session/create', { name: invitedUser.email, pass: invitedUser.inviteCode }).then(function() {

      sailsSocket.put('/user/' + invitedUser.id, invitedUser).then(function() {
        window.location.replace('/#/dasboard');
      });

    });

  };

}]);
