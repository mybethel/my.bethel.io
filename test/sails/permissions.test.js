var assert = require('assert'),
    request = require('supertest');

describe('Permissions', function() {

  describe('GET /', function() {
    it('should redirect to login screen', function(done) {
      request(sails.hooks.http.server).get('/').expect(302, done);
    });
  });

});
