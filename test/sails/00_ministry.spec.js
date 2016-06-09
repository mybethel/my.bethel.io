const expect = require('expect');
const request = require('supertest');

const fixtures = require('../fixtures');

describe('ministry', function() {

  it('allows the creation of a ministry', function(done) {
    Ministry.findOrCreate(fixtures.ministry).exec(function(err, ministry) {
      expect(ministry.name).toEqual(fixtures.ministry.name);
      done(err);
    });
  });

});
