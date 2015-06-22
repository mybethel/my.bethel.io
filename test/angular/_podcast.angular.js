window.test = window.test || {};
window.test.podcast = function() {

  describe('Podcasting', function() {

    describe('podcastWizardController', function() {

      setupController('podcastWizardController');

      beforeEach(inject(function (WizardHandler) {
        angular.element(document.body).append('<input class="focus" />');

        WizardHandler.wizard = function() {
          return {
            next: function() {}
          };
        };
      }));

      it('bootstraps successfully.', function () {
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
        scope.selectThumbnail([ { name: 'testFile.jpg' }]);
        expect(scope.thumbnailUploading).toEqual(true);
        expect(scope.thumbnail.name).toEqual('testFile.jpg');
        // Thumbnail is sent to S3.
        scope.uploadThumbnail({
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
