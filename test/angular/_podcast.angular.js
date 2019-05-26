window.test = window.test || {};
window.test.podcast = function() {

  describe('Podcasting', function() {

    describe('podcastDetailController', function() {
      setupController('podcastDetailController', { $stateParams: { podcastId: 2 } });

      it('bootstraps successfully.', function() {
        expect(scope.id).toEqual(2);
        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'get').and.callFake(function() {
          var deferred = q.defer();
          deferred.resolve({
            podcast: {
              name: 'Test',
              tags: ['sermon', 'tv'],
              media: []
            },
            s3form: { secret: 'not_telling' },
            uploadEpisode: { form: 'data' }
          });
          return deferred.promise;
        });
        spyOn(sailsSocket, 'sync').and.callFake(function() {
          var deferred = q.defer();
          deferred.resolve({});
          return deferred.promise;
        });
        ctrl.init();
        expect(sailsSocket.get).toHaveBeenCalledWith('/podcast/edit/2');
        scope.$digest();
        expect(sailsSocket.sync).toHaveBeenCalled();
        expect(scope.podcastTags).toBe('sermon, tv');
      });

      it('redirects to /podcast if podcast is deleted', function() {
        $location = injector.get('$location');
        sailsSocket = injector.get('sailsSocket');
        spyOn(sailsSocket, 'get').and.callFake(function() {
          var deferred = q.defer();
          deferred.resolve({
            podcast: { name: 'Test', deleted: true }
          });
          return deferred.promise;
        });
        ctrl.init();
        scope.$digest();
        expect($location.path()).toBe('/podcast');
      });

    });

    describe('podcastListController', function() {
      setupController('podcastListController');

      it('bootstraps successfully.', function() {
        scope.$root.ministry = false;
        scope.$root.$apply();
        scope.init();
        scope.$root.ministry = { id: 1 };
        scope.$root.$apply();
        expect(scope.podcasts).toBeDefined();
      });

      it('allows the user to select a podcast.', function() {
        $state = injector.get('$state');
        spyOn($state, 'go');
        scope.view(1);
        expect($state.go).toHaveBeenCalledWith('podcastView', { podcastId: 1 });
      });

      it('displays a wizard to walk the user through creating a new podcast.', function() {
        $mdDialog = injector.get('$mdDialog');
        spyOn($mdDialog, 'show').and.callFake(function() {
          var deferred = q.defer();
          deferred.resolve({ id: 1, name: 'Test Podcast' });
          return deferred.promise;
        });
        scope.showWizard({});
        scope.$digest();
        expect(scope.podcasts[0].name).toEqual('Test Podcast');
      });

    });

    describe('podcastMediaController', function() {
      setupController('podcastMediaController', { mediaId: 2 });

      it('bootstraps successfully.', function() {
        expect(true).toEqual(true);
      });
    });

    describe('podcastWizardController', function() {
      setupController('podcastWizardController');

      beforeEach(inject(function(WizardHandler) {
        angular.element(document.body).append('<input class="focus" />');

        WizardHandler.wizard = function() {
          return {
            next: function() {}
          };
        };
      }));

      it('bootstraps successfully.', function() {
        expect(scope.newPodcast).toBeDefined();

        scope.$root.ministry = undefined;
        scope.$root.$apply();
        expect(scope.services).toBeUndefined();

        scope.$root.ministry = { id: 1 };
        scope.$root.$apply();
        expect(scope.services).toBeDefined();

        $timeout = injector.get('$timeout');
        $timeout.flush();
      });

      it('allows the user to select a podcast type.', function() {
        scope.selectType(1);
        expect(scope.newPodcast.type).toEqual(1);
      });

      it('allows the user to select the storage backend.', function() {
        scope.selectSource(1);
        expect(scope.newPodcast.source).toEqual(1);

        scope.selectSource(2);
        expect(scope.newPodcast.source).toEqual(2);
      });

      it('ignores when the user selects to connect a new account.', function() {
        scope.newPodcast.service = 'SERVICES_NEW';
        scope.$digest();
        expect(scope.newPodcast.service).toBeUndefined();

        scope.newPodcast.service = 'vimeo_account';
        scope.$digest();
        expect(scope.newPodcast.service).toEqual('vimeo_account');
      });

      it('uploads a thumbnail to the newly created podcast.', function() {
        // User selects a thumbnail.
        scope.selectThumbnail([{ name: 'testFile.jpg' }]);
        expect(scope.thumbnailUploading).toEqual(true);
        expect(scope.thumbnail.name).toEqual('testFile.jpg');
        // Thumbnail is sent to S3.
        scope.uploadThumbnail({
          action: 'https://s3.amazonaws.com/cloud.bethel.io',
          key: 's3key'
        });
        // After upload is finished, thumbnail applied.
        scope.applyThumbnail();
        expect(scope.newPodcast.temporaryImage).toEqual('testFile.jpg');
        expect(scope.thumbnailUploading).toEqual(false);
      });

      it('creates a podcast once the wizard has finished.', function() {
        scope.createPodcast();
        // @todo: needs an assertion!
      });

      it('allows the user to cancel the wizard at any time.', function() {
        scope.cancel();
        // @todo: needs an assertion!
      });

    });

  });

};
