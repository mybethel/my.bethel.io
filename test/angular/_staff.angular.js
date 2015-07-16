window.test = window.test || {};
window.test.staff = function() {

  describe('Staff', function() {

    describe('staffController', function() {

      setupController('staffController');

      it('will not redirect admins.', function() {
        $location = injector.get('$location');

        scope.$root.isAdmin = true;
        scope.$root.$apply();
        $location.path('/staff/user');
        expect($location.path()).toBe('/staff/user');
      });

      it('redirects non-admins to dashboard.', function() {
        $location = injector.get('$location');
        scope.$root.isAdmin = false;
        scope.$root.$apply();
        expect($location.path()).toBe('/dashboard');
      });

      it('redirects admins to staff/user page if /staff is visited.', function() {
        $location = injector.get('$location');
        scope.$root.isAdmin = true;
        $location.path('/staff');
        ctrl.init();
        expect($location.path()).toBe('/staff/user');
      });
    });

    describe('staffUserListController', function() {

      setupController('staffUserListController');

      it('bootstraps successfully.', function() {
        expect(scope.$parent.tabIndex).toBe(0);
        expect(scope.orderByField).toEqual('name');

        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'populateMany').and.callThrough();

        ctrl.init();
        expect(sailsSocket.populateMany.calls.argsFor(0)).toEqual(['/user']);
        expect(sailsSocket.populateMany.calls.argsFor(1)).toEqual(['/ministry']);
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

      it('calls state transition when user row is clicked', function() {
        var requestUrl = 'staff.detailedUser',
            userRequest = {'userId': 1};

        $state = injector.get('$state');
        spyOn($state, 'transitionTo');
        scope.detailedUserTransition(1);
        expect($state.transitionTo).toHaveBeenCalledWith(requestUrl, userRequest);
      });

      it('calls mddialog show on showCreateUser', function() {
        scope.users = [];
        $mdDialog = injector.get('$mdDialog');
        $q = injector.get('$q');

        spyOn($mdDialog, 'show').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: "Mal"});
          return deferred.promise;
        });

        scope.showCreateUser({});
        scope.$digest();
        expect(scope.users[0].name).toBe('Mal');
      });
    });

    describe('staffMinistryListController', function() {

      setupController('staffMinistryListController');

      it('bootstraps successfully.', function() {
        expect(scope.$parent.tabIndex).toBe(1);
        expect(scope.orderByField).toEqual('createdAt');
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
        $mdDialog = injector.get('$mdDialog');
        $q = injector.get('$q');

        spyOn($mdDialog, 'show').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: 'Season 2 Ministry'});
          return deferred.promise;
        });

        scope.showCreateMinistry({});
        scope.$digest();
        expect(scope.ministries[0].name).toBe('Season 2 Ministry');
      });
    });

    describe('staffUserCreateController', function() {

      setupController('staffUserCreateController', {'ministries': [{id: 1, name: "One Ministry"}, {id: 2, name: "Two Ministry"}]});

      it('bootstraps successfully', function() {
        scope.createUser = {$setValidity: function() {} };
        expect(scope.newUser).toBeDefined();
        expect(scope.ministries[0].name).toEqual("One Ministry");
        expect(scope.searchText).toEqual("");

        $timeout = injector.get('$timeout');
        $timeout.flush();
      });

      it('skips ministry creation if existing ministry is selected', function() {
        scope.newUser = {ministry: {id: 1}};
        spyOn(scope, 'createNewUser');
        var sender = {$invalid: false};

        scope.createUserSubmit(sender);
        expect(scope.createNewUser).toHaveBeenCalled();
      });

      it('populates ministries after new ministry created', function() {
        var ministryToCreate = {name: 'Inland Coastal Ministry'};

        scope.ministries = [];
        spyOn(scope, 'createNewUser');

        ctrl.populateMinistries(ministryToCreate);
        expect(scope.ministries[0].name).toEqual(ministryToCreate.name);
        expect(scope.createNewUser).toHaveBeenCalledWith(ministryToCreate);
      });

      it('stops submission if new user form is invalid', function() {
        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'post').and.callThrough();

        var sender = {$invalid: true};

        scope.createUserSubmit(sender);
        expect(sailsSocket.post).not.toHaveBeenCalled();
      });

      it('creates a ministry if specified with new user', function() {
        sailsSocket = injector.get('sailsSocket');
        $q = injector.get('$q');
        scope.createUser = {$setValidity: function() {} };
        scope.ministries = [];
        scope.searchText = 'Mew Ninistry';
        var sender = {$invalid: false};

        spyOn(sailsSocket, 'post').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: "Mew Ninistry"});
          return deferred.promise;
        });
        scope.createUserSubmit(sender);
        scope.$digest();

        expect(sailsSocket.post).toHaveBeenCalled();
        expect(scope.ministries[0].name).toEqual('Mew Ninistry');
      });

      it('uses an existing ministry if searchText matches ministry name', function() {
        scope.newUser = {};
        scope.searchText = "one ministry";
        var sender = {$invalid: false};

        scope.createUserSubmit(sender);

        expect(scope.newUser.ministry).toEqual(1);
      });

      it('does not close dialog if there were errors creating user', function() {
        var response = {invalidAttributes: {}};
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'hide');

        ctrl.handleNewUser(response);
        expect($mdDialog.hide).not.toHaveBeenCalledWith();
      });

      it('handles new users after promise with errors', function() {
        var newUser = {id: 1, name: 'Fiona'};
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'hide');

        ctrl.handleNewUser(newUser);
        expect($mdDialog.hide).toHaveBeenCalledWith(newUser);
      });

      it('creates new user after form submitted and ministry created if necessary', function() {
        sailsSocket = injector.get('sailsSocket');
        $q = injector.get('$q');

        spyOn(sailsSocket, 'post').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: "Uew Nser"});
          return deferred.promise;
        });

        scope.newUser = {name: 'Laguna Larry'};
        scope.newMinistry = {id: 3};

        scope.createNewUser(scope.newMinistry);
        expect(scope.newUser.ministry).toEqual(3);

        expect(sailsSocket.post).toHaveBeenCalledWith('/user', scope.newUser);

        scope.newUser = {name: 'Paradise Peter', ministry: {id: 4}};

        scope.createNewUser();
        expect(scope.newUser.ministry).toEqual(4);
      });

      it('hides dialog when cancel is called', function() {
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'cancel');
        scope.cancel();
        expect($mdDialog.cancel).toHaveBeenCalled();
      });
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

      it('creates a new ministry', function() {
        scope.newMinistry = {name: 'UnitTest Ministry'};
        $mdDialog = injector.get('$mdDialog');
        sailsSocket = injector.get('sailsSocket');
        $q = injector.get('$q');

        spyOn($mdDialog, 'hide');
        spyOn(sailsSocket, 'post').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve(scope.newMinistry);
          return deferred.promise;
        });

        scope.createNewMinistry();
        scope.$digest();

        expect(sailsSocket.post).toHaveBeenCalled();
        expect($mdDialog.hide).toHaveBeenCalledWith(scope.newMinistry);
      });
    });

    describe('staffUserDetailController', function() {

      setupController('staffUserDetailController', {'$stateParams': {userId: '543b2b0b06ee1cb56414cbc4'}});

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(0);

        expect(scope.id).toEqual('543b2b0b06ee1cb56414cbc4');
        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'populateOne').and.callFake(function() {
          return {id: 1, name: 'Francisco'}
        });

        ctrl.init();
        expect(sailsSocket.populateOne).toHaveBeenCalledWith('/user/543b2b0b06ee1cb56414cbc4');
        scope.$digest();

        expect(scope.user.name).toEqual('Francisco');
      });

      it('redirects if invalid user id provided', function() {
        $location = injector.get('$location');

        expect(scope.id).toBe('543b2b0b06ee1cb56414cbc4');

        $location.path('/staff/user/' + scope.id);
        scope.$apply();
        expect($location.path()).toBe('/staff/user/' + scope.id);

        scope.id = 'not24characters';
        scope.$apply();
        expect($location.path()).toBe('/staff/user');
      });

      it('toggles the lock status of a user', function() {
        var updatedUser = {isLocked: true};
        scope.user = {isLocked: false};
        ctrl.setLockedStatus(updatedUser, {});
        expect(scope.user.isLocked).toBe(true);
      });

      it('requests the api change the locked status of a user', function() {
        sailsSocket = injector.get('sailsSocket');
        $q = injector.get('$q');
        scope.user = {};

        spyOn(sailsSocket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({isLocked: true});
          return deferred.promise;
        });
        scope.lockUnlock();
        scope.$digest();

        expect(sailsSocket.get).toHaveBeenCalled();
        expect(scope.user.isLocked).toEqual(true);
      });

      it('changes email confirmation status after send', function() {
        scope.emailSending = true;
        ctrl.getEmailConfirmation();
        expect(scope.emailSending).toBe(false);
      });

      it('requests email sending through sockets', function() {
        sailsSocket = injector.get('sailsSocket');
        $q = injector.get('$q');

        spyOn(sailsSocket, 'get').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        });
        scope.sendInviteEmail();
        expect(scope.emailSending).toBe(true);
        scope.$digest();

        expect(sailsSocket.get).toHaveBeenCalled();
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

      setupController('staffMinistryDetailController', {'$stateParams': {ministryId: '5574d437484aee280fa67fc2'}});

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(1);
        expect(scope.ministry).toBeDefined();

        expect(scope.id).toEqual('5574d437484aee280fa67fc2');
        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'populateOne').and.callFake(function() {
          return {id: '5574d437484aee280fa67fc2', name: 'Francisco\s Ministry'}
        });

        ctrl.init();
        expect(sailsSocket.populateOne).toHaveBeenCalledWith('/ministry/5574d437484aee280fa67fc2');
        scope.$digest();

        expect(scope.ministry.name).toEqual('Francisco\s Ministry');
      });

      it('redirects if invalid ministry id provided', function() {
        $location = injector.get('$location');

        expect(scope.id).toBe('5574d437484aee280fa67fc2');

        $location.path('/staff/ministry/' + scope.id);
        scope.$apply();
        expect($location.path()).toBe('/staff/ministry/' + scope.id);

        scope.id = 'not24characters';
        scope.$apply();
        expect($location.path()).toBe('/staff/ministry');
      });
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

  });

};
