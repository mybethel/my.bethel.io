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
        $location.path('/staff/ministry');
        scope.$apply();
        expect($location.path()).toBe('/staff/ministry');
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

    describe('staffUserCreateController', function() {

      setupController('staffUserCreateController');
    });

    describe('staffMinistryCreateController', function() {

      setupController('staffMinistryCreateController');

      it('bootstraps successfully', function() {
        $timeout = injector.get('$timeout');
        $timeout.flush();
      });

      it('hides dialog when cancel is called', function() {
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'cancel');
        scope.cancel();
        expect($mdDialog.cancel).toHaveBeenCalled();
      });

      beforeEach(inject(function ($socket) {
        $q = injector.get('$q');
        _.extend($socket, {
          post: function(place, thing) {
            deferred = $q.defer();
            return deferred.promise;
          }
        });
      }));

      it('creates a new ministry', function() {
        scope.newMinistry = {name: "UnitTest Ministry"};

        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'hide');

        scope.createNewMinistry();
        deferred.resolve(scope.newMinistry);
        scope.$digest();

        expect($mdDialog.hide).toHaveBeenCalledWith(scope.newMinistry);
      });
    });

    describe('staffUserDetailController', function() {

      setupController('staffUserDetailController');

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(0);
      });

      it('redirects if invalid user id provided', function() {
        $stateParams = injector.get('$stateParams');
        $location = injector.get('$location');

        $stateParams.userId = '543b2b0b06ee1cb56414cbc4';
        $location.path('/staff/user/543b2b0b06ee1cb56414cbc4');
        scope.$apply();
        expect($location.path()).toBe('/staff/user/543b2b0b06ee1cb56414cbc4');

        $stateParams.userId = 'not24characters';
        scope.$apply();
        expect($location.path()).toBe('/staff/user');
      });

      it('loads a user with populateUser', function() {
        var user = {name: 'Francisco'};

        expect(scope.user).toBeUndefined();
        ctrl.populateUser(user);
        expect(scope.user).toBe(user);
      });

      it('gets a user through sockets', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');
        scope.user = {};

        spyOn($socket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({id: 1, name: 'Francisco'});
          return deferred.promise;
        });
        ctrl.init();
        scope.$digest();

        expect($socket.get).toHaveBeenCalled();
        expect(scope.user.name).toEqual('Francisco');
      });

      it('toggles the lock status of a user', function() {
        var updatedUser = {isLocked: true};
        scope.user = {isLocked: false};
        ctrl.setLockedStatus(updatedUser, {});
        expect(scope.user.isLocked).toBe(true);
      });

      it('requests the api change the locked status of a user', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');
        scope.user = {};

        spyOn($socket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({isLocked: true});
          return deferred.promise;
        });
        scope.lockUnlock();
        scope.$digest();

        expect($socket.get).toHaveBeenCalled();
        expect(scope.user.isLocked).toEqual(true);
      });

      it('changes email confirmation status after send', function() {
        scope.emailSending = true;
        ctrl.getEmailConfirmation();
        expect(scope.emailSending).toBe(false);
      });

      it('requests email sending through sockets', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');

        spyOn($socket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        });
        scope.sendInviteEmail();
        expect(scope.emailSending).toBe(true);
        scope.$digest();

        expect($socket.get).toHaveBeenCalled();
        expect(scope.emailSending).toEqual(false);
      });

      it('watches emailSending status and removes from scope', function() {
        $timeout = injector.get('$timeout');
        scope.emailSending = true;
        scope.$apply();
        expect(scope.emailSending).toBe(true);

        scope.emailSending = false;
        scope.$apply();
        $timeout.flush();
        expect(scope.emailSending).toBeUndefined();
      });
    });

    describe('staffMinistryDetailController', function() {

      setupController('staffMinistryDetailController');

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(1);
        expect(scope.ministry).toBeUndefined();
      });

      it('redirects if invalid ministry id provided', function() {
        $stateParams = injector.get('$stateParams');
        $location = injector.get('$location');

        $stateParams.ministryId = '5574d437484aee280fa67fc2';
        $location.path('/staff/ministry/5574d437484aee280fa67fc2');
        scope.$apply();
        expect($location.path()).toBe('/staff/ministry/5574d437484aee280fa67fc2');

        $stateParams.ministryId = 'not24characters';
        scope.$apply();
        expect($location.path()).toBe('/staff/ministry');
      });

      it('loads a ministry with populateMinistry', function() {
        var ministry = {name: 'Francisco'};

        expect(scope.ministry).toBeUndefined();
        ctrl.populateMinistry(ministry);
        expect(scope.ministry).toBe(ministry);
      });

      it('gets a ministry through sockets', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');

        spyOn($socket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({id: 1, name: 'Francisco\s Ministry'});
          return deferred.promise;
        });
        ctrl.init();
        scope.$digest();

        expect($socket.get).toHaveBeenCalled();
        expect(scope.ministry.name).toEqual('Francisco\s Ministry');
      });

    });

  });

};
