var setupController = function(controllerName, params) {

  params = params || {};

  beforeEach(inject(function ($rootScope, $controller, $injector, $httpBackend, $q) {
    scope = $rootScope.$new();
    params['$scope'] = scope;
    ctrl = $controller(controllerName, params);
    injector = $injector;
    q = $q;

    httpBackend = $httpBackend;
    httpBackend.whenGET(/csrfToken/).respond(200, { _csrf: 'abcd1234' });
    httpBackend.whenGET(/i18n/).respond(200);
    httpBackend.whenGET(/templates\/|View\.html/).respond(200);
    httpBackend.whenGET(/templates\/|features\/.*\.html/).respond(200);
  }));

};

io.sails.environment = 'production';

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
  window.test.staff();

});
