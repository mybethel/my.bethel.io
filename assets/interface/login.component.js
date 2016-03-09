// The login screen presented to an anonymous user when any route is loaded.

// Component Setup
// ---------------

// All component bindings are one-way:
// * `confirmed`: Whether the session check response has been received. Until
//   this evaluates to `true`, the form itself will remain hidden.

angular.module('Bethel.util').component('login', {
  bindings: {
    confirmed: '<'
  },
  templateUrl: 'interface/login.template.html',
  controller: LoginComponent
});

// Component Controller
// --------------------

function LoginComponent(authService, sailsSocket) {

  var $ctrl = this;

  // User credentials are sent through socket.io on login.
  $ctrl.login = function(scope) {
    if (scope.userLoginForm) $ctrl.form = scope.userLoginForm;
    sailsSocket.post('/session/create', $ctrl.credentials).then($ctrl.loginConfirmed, $ctrl.loginError);
  };

  // When a login is successful we emit an event through `angular-http-auth`
  // which will pull session information for the current user through sockets
  // and update the UI accordingly.
  // https://github.com/witoldsz/angular-http-auth
  $ctrl.loginConfirmed = function() {
    authService.loginConfirmed();
  };

  $ctrl.loginError = function(response) {

    // Whenever possible we attempt to provide hints to the user and highlight
    // the field(s) on the frontend which were entered incorrectly.
    if (response.error && $ctrl.form) {
      $ctrl.form.email.$setValidity('loginValid', !response.error.name);
      $ctrl.form.password.$setValidity('loginValid', !response.error.pass);
    }

    // A page reload doesn't occur on login so we provide an extra visual cue
    // to the user to inform them of the login error by shaking the dialog box.
    angular.element(document.querySelector('#login-signup'))
      .addClass('shake animated')
      .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        angular.element(this).removeClass('shake animated');
      });
  };

}

LoginComponent.$inject = ['authService', 'sailsSocket'];
