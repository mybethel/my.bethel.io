var setupController = function(controllerName) {

  beforeEach(inject(function ($rootScope, $controller, $injector, $httpBackend, $q) {
    scope = $rootScope.$new();
    ctrl = $controller(controllerName, {
      $scope: scope
    });
    injector = $injector;
    q = $q;

    httpBackend = $httpBackend;
    httpBackend.whenGET(/i18n/).respond(200);
    httpBackend.whenGET(/templates\//).respond(200);
  }));

};

describe('Angular unit tests', function() {

  beforeEach(module('Bethel'));
  beforeEach(module('ngMockE2E'));

  describe('AppCtrl', function() {

    setupController('AppCtrl');

    it('bootstraps successfully.', function () {
      expect(true).toEqual(true);
    });

  });

  window.test.podcast();

});
