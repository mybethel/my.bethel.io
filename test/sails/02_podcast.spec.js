const expect = require('expect');
const request = require('supertest');

const fixtures = require('../fixtures');

describe('podcast', function() {

  var podcastId, mediaId;

  it('allows the creation of a podcast', function(done) {
    Ministry.findOne({ name: fixtures.ministry.name }).exec(function(err, ministry) {
      if (err) return done(err);
      Podcast.create({ name: 'Test Podcast', type: 1, source: 1, ministry: ministry.id }).exec(function(err, podcast) {
        if (err) return done(err);
        podcastId = podcast.id;
        expect(podcast.name).toEqual('Test Podcast');
        done();
      });
    });
  });

  it('associates uploaded media with a podcast', function(done) {
    PodcastMedia.create({ name: 'Episode 1', url: 'http://cloud.bethel.io/', podcast: podcastId }).exec(function (err, media) {
      if (err) return done(err);
      mediaId = media.id;

      PodcastMedia.findOne(mediaId).populate('podcast').exec(function(err, podcastMedia) {
        if (err) return done(err);
        expect(podcastMedia.podcast.name).toEqual('Test Podcast');
        expect(podcastMedia.name).toEqual('Episode 1');
        done();
      });
    });
  });

  it('allows the user to embed a single podcast episode', function(done) {
    request(sails.hooks.http.app)
      .get('/podcast/embed/episode/' + mediaId)
      .expect(200, done);
  });

  it('prohibits an embed without the proper parameters', function(done) {
    request(sails.hooks.http.app)
      .get('/podcast/embed/' + mediaId)
      .expect(400, function() {
        request(sails.hooks.http.app)
          .get('/podcast/embed')
          .expect(400, function() {
            request(sails.hooks.http.app)
              .get('/podcast/embed/episode/1234')
              .expect(404, done);
          });
      });
  });

  it('builds an iTunes podcast feed for each podcast', function(done) {
    request(sails.hooks.http.app)
      .get('/podcast/feed/' + podcastId)
      .expect(200, done);
  });

  describe('wordpress plugin', function() {

    it('validates that a ministry ID is provided', done =>
      request(sails.hooks.http.app)
        .get('/podcast/list/')
        .expect(400, done));

    // it('validates that a ministry ID is provided', done =>
    //   request(sails.hooks.http.app)
    //     .get('/podcast/list/')
    //     .expect(400, done));

  });

});
