var setupController = function(controllerName) {

  beforeEach(inject(function ($rootScope, $controller, $injector, $httpBackend) {
    scope = $rootScope.$new();
    ctrl = $controller(controllerName, {
      $scope: scope
    });
    injector = $injector;

    httpBackend = $httpBackend;
    httpBackend.whenGET(/^templates\//).passThrough();
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

});