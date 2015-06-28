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

      it('redirects admins to staff/user page if /staff is visited.', function () {
        $location = injector.get('$location');
        scope.$root.isAdmin = true;
        $location.path('/staff');
        ctrl.init();
        expect($location.path()).toBe('/staff/user');
      });

    });

    describe('staffUserListController', function() {

      setupController('staffUserListController');

      it('bootstraps successfully.', function () {
        expect(scope.$parent.tabIndex).toBe(0);
      });

      it('redirects non-admins to dashboard', function() {
        $location = injector.get('$location');
        scope.$root.isAdmin = false;
        scope.$apply();
        expect($location.path()).toBe('/dashboard');

        scope.$root.isAdmin = true;
        $location.path('/staff/user');
        scope.$apply();
        expect($location.path()).toBe('/staff/user');
      });

      it('populates users and ministries on init', function() {
        expect(scope.users).toBeUndefined();
        expect(scope.ministries).toBeUndefined();

        ctrl.populateUsers([]);
        ctrl.populateMinistries([]);

        expect(scope.users).toBeDefined();
        expect(scope.ministries).toBeDefined();
      });

      it('calls state transition when user row is clicked', function() {
        var requestUrl = 'staff.detailedUser',
            userRequest = {'userId': 1};

        $state = injector.get('$state');
        spyOn($state, 'transitionTo');
        scope.detailedUserTransition(1);
        expect($state.transitionTo).toHaveBeenCalledWith(requestUrl, userRequest);
      });

      beforeEach(inject(function ($mdDialog) {
        $q = injector.get('$q');
        _.extend($mdDialog, {
          show: function(thing) {
            deferred = $q.defer();
            return deferred.promise;
          }
        });
      }));

      it('calls mddialog show on showCreateUser', function() {
        scope.users = [];
        scope.showCreateUser({});
        deferred.resolve({name: "Mal"});
        scope.$digest();
        expect(scope.users[0].name).toBe("Mal");
      });

    });

    describe('staffMinistryListController', function() {

      setupController('staffMinistryListController');

      it('bootstraps successfully.', function () {
        expect(scope.$parent.tabIndex).toBe(1);
      });

      it('redirects non-admins to dashboard', function() {
        $location = injector.get('$location');
        scope.$root.isAdmin = false;
        scope.$apply();
        expect($location.path()).toBe('/dashboard');

        scope.$root.isAdmin = true;
        $location.path('/staff/ministries');
        scope.$apply();
        expect($location.path()).toBe('/staff/ministries');
      });


      it('populates ministries on init', function() {
        expect(scope.ministries).toBeUndefined();
        ctrl.populateMinistries([]);
        expect(scope.ministries).toBeDefined();
      });

      beforeEach(inject(function ($mdDialog) {
        $q = injector.get('$q');
        _.extend($mdDialog, {
          show: function(thing) {
            deferred = $q.defer();
            return deferred.promise;
          }
        });
      }));

      it('calls state transition when ministry row is clicked', function() {
        var requestUrl = 'staff.detailedMinistry',
            userRequest = {'ministryId': 1};

        $state = injector.get('$state');
        spyOn($state, 'transitionTo');
        scope.detailedMinistryTransition(1);
        expect($state.transitionTo).toHaveBeenCalledWith(requestUrl, userRequest);
      });

      it('calls mddialog show on showCreateMinistry', function() {
        scope.ministries = [];
        scope.showCreateMinistry({});
        deferred.resolve({name: "Season 2 Ministry"});
        scope.$digest();
        expect(scope.ministries[0].name).toBe("Season 2 Ministry");
      });

    });

  });

};
