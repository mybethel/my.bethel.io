var assert = require('assert'),
    request = require('supertest');

// Here goes a module test
describe('Podcast', function() {

  describe('GET /podcast/feed/1', function() {
    it('should respond with podcast XML', function(done) {
      request(sails.hooks.http.server).get('/podcast/feed/532d0c09b6e4618b8fb78f2e').expect(200, done);
    });
  });

});
