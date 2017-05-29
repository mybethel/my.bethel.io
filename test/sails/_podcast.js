var expect = require('expect'),
    request = require('supertest');

describe('podcast', function() {

  var podcastId, mediaId;

  it('allows the creation of a podcast', function(done) {
    Ministry.findOne({ name: 'Bethel Technologies' }).exec(function(err, ministry) {
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

  it('prohibits an embed without the proper parameters', function(done) {
    request(sails.hooks.http.app)
      .get('/podcast/embed/' + mediaId)
      .expect(400, function() {
        request(sails.hooks.http.app)
          .get('/podcast/embed')
          .expect(400, done);
      });
  });

  it('builds an iTunes podcast feed for each podcast', function(done) {
    request(sails.hooks.http.app)
      .get('/podcast/feed/' + podcastId)
      .expect(200, done);
  });

});
