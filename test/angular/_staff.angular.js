window.test = window.test || {};
window.test.staff = function() {

  describe('Staff', function() {

    describe('staffController', function() {

      setupController('staffController');

      it('will not redirect admins.', function () {

        $location = injector.get('$location');

        scope.$root.isAdmin = true;
        scope.$root.$apply();
        $location.path('/staff/user');
        expect($location.path()).toBe('/staff/user');

      });

      it('redirects non-admins to dashboard.', function () {

        $location = injector.get('$location');

        scope.$root.isAdmin = false;
        scope.$root.$apply();
        expect($location.path()).toBe('/dashboard');

      });

      // it('redirects admins to staff/user page if /staff is visited.', function () {

      //   $location = injector.get('$location');
      //   $location.path('/staff');
      //   scope.$root.$digest();
      //   expect($location.path()).toBe('/staff/user');

      // });

    });

  });

};
