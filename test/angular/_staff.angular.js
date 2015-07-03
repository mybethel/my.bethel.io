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
        deferred.resolve({name: 'Mal'});
        scope.$digest();
        expect(scope.users[0].name).toBe('Mal');
      });
    });

    describe('staffMinistryListController', function() {

      setupController('staffMinistryListController');

      it('bootstraps successfully.', function() {
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
        deferred.resolve({name: 'Season 2 Ministry'});
        scope.$digest();
        expect(scope.ministries[0].name).toBe('Season 2 Ministry');
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
        scope.newMinistry = {name: 'UnitTest Ministry'};

        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'hide');

        scope.createNewMinistry();
        deferred.resolve(scope.newMinistry);
        scope.$digest();

        expect($mdDialog.hide).toHaveBeenCalledWith(scope.newMinistry);
      });
    });

    describe('staffUserCreateController', function() {

      setupController('staffUserCreateController', {'ministries': []});

      it('bootstraps successfully', function() {
        expect(scope.newUser).toBeDefined();
        expect(scope.ministries).toEqual([]);
        expect(scope.searchText).toEqual("");

        $timeout = injector.get('$timeout');
        $timeout.flush();
      });

      it('watches isExisting ministry property and clears ministry select', function() {
        scope.newUser = {newMinistry: {}};
        scope.existing = {isExisting: 'existing'};
        scope.$apply();
        expect(scope.newUser.newMinistry).toBeUndefined();

        scope.newUser = {ministry: {}};
        scope.existing = {isExisting: 'new'};
        scope.$apply();
        expect(scope.newUser.ministry).toBeUndefined();
      });

      it('skips ministry creation if existing ministry is selected', function() {
        scope.newUser = {ministry: {id: 1}};
        spyOn(scope, 'createNewUser');

        scope.createUserSubmit();
        expect(scope.createNewUser).toHaveBeenCalled();
      });

      it('populates ministries after new ministry created', function() {
        var ministryToCreate = {name: 'Inland Coastal Ministry'};

        scope.ministries = [];
        expect(scope.newMinistry).toBeUndefined();
        spyOn(scope, 'createNewUser');

        ctrl.populateMinistries(ministryToCreate);
        expect(scope.ministries[0].name).toEqual(ministryToCreate.name);
        expect(scope.createNewUser).toHaveBeenCalledWith(ministryToCreate);
      });

      it('creates a ministry if specified with new user', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');
        expect(scope.newMinistry).toBeUndefined();
        scope.newUser = {newMinistry: {id: 3, name: "Mew Nimistry"}};
        scope.ministries = [];

        spyOn($socket, 'post').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: "Mew Nimistry"});
          return deferred.promise;
        });
        scope.createUserSubmit();
        scope.$digest();

        expect($socket.post).toHaveBeenCalled();
        expect(scope.ministries[0].name).toEqual('Mew Nimistry');
        expect(scope.newMinistry.name).toEqual('Mew Nimistry');
      });

      it('handles new users after promise with errors', function() {
        var newUser = {id: 1, name: 'Fiona'};
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'hide');

        ctrl.handleNewUser(newUser);
        expect($mdDialog.hide).toHaveBeenCalledWith(newUser);
      });

      it('creates new user after form submitted and ministry created if necessary', function() {
        $socket = injector.get('$socket');
        $q = injector.get('$q');

        spyOn($socket, 'post').and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve({name: "Uew Nser"});
          return deferred.promise;
        });

        scope.newUser = {name: 'Laguna Larry'};
        scope.newMinistry = {id: 3};

        scope.createNewUser(scope.newMinistry);
        expect(scope.newUser.ministry).toEqual(3);

        expect($socket.post).toHaveBeenCalledWith('/user', scope.newUser);

        scope.newUser = {name: 'Paradise Peter', ministry: {id: 4}};

        scope.createNewUser();
        expect(scope.newUser.ministry).toEqual(4);
      });

      it('handleNewUser generates errors if invalid user attributes are defined', function() {
        var errors = {invalidAttributes: {message: 'Everything/s Broke'}};
        spyOn(ctrl, 'createErrors');

        ctrl.handleNewUser(errors);
        expect(ctrl.createErrors).toHaveBeenCalledWith(errors);
      });

      it('creates errors with createErrors', function() {
        expect(scope.errors).toBeUndefined();
        var validationErrors = {
              summary: 'Stuff Broke Yo',
              invalidAttributes: {
                email: [{
                  message: 'email broke',
                  rule: 'email'
                }]
              }
            };

        ctrl.createErrors(validationErrors);
        expect(scope.errors).toBeDefined();
        expect(scope.errors.summary).toEqual(validationErrors.summary);
        expect(scope.errors.many[0]).toEqual('email broke');
      });

      it('resets ministry select if new ministry is created with errors in user creation', function() {
        scope.newUser = {};
        scope.newMinistry = {id: 3, name: 'just created'};
        scope.existing = {isExisting: 'new'};

        ctrl.createErrors({});
        expect(scope.existing.isExisting).toEqual('existing');
        expect(scope.newUser.ministry).toEqual(scope.newMinistry);
      });

      it('hides dialog when cancel is called', function() {
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'cancel');
        scope.cancel();
        expect($mdDialog.cancel).toHaveBeenCalled();
      });

    });

    describe('staffUserDetailController', function() {

      setupController('staffUserDetailController', {'$stateParams': {userId: '543b2b0b06ee1cb56414cbc4'}});

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(0);
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

      setupController('staffMinistryDetailController', {'$stateParams': {ministryId: '5574d437484aee280fa67fc2'}});

      it('bootstraps successfully', function() {
        expect(scope.$parent.tabIndex).toBe(1);
        expect(scope.ministry).toBeUndefined();
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
