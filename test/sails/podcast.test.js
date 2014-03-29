var assert = require('assert'),
    request = require('supertest');

// Here goes a module test
describe('Podcast', function() {

  describe('GET /podcast/feed', function() {
    it('should load Harvest Bible Oakville video podcast', function(done) {
      request(sails.hooks.http.server).get('/podcast/feed/53225a780c47fa1100b5ca3a').expect(200, done);
    });
    it('should load Coastal Community audio podcast', function(done) {
      request(sails.hooks.http.server).get('/podcast/feed/5313b36d3ff2a012009bb790').expect(200, done);
    });
  });

  describe('GET /podcastmedia/related', function() {
    it('should display all related podcast media', function(done) {
      request(sails.hooks.http.server).get('/podcastmedia/related').expect(200, done);
    });
  });

});
