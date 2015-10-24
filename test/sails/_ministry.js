var expect = require('expect'),
    request = require('supertest');

describe('ministry', function() {

  var podcastId, mediaId;

  it('allows the creation of a ministry', function(done) {
    Ministry.create({ name: 'Bethel Technologies' }).exec(function (err, ministry) {
      if (err) return done(err);
      expect(ministry.name).toEqual('Bethel Technologies');
      done();
    });
  });

});
