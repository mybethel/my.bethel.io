var assert = require('assert'),
    Sails = require('sails'),
    request = require('supertest');

// Global before hook
before(function (done) {
  this.timeout(10000);
  // Lift Sails with read-only database access.
  Sails.lift({
    log: { level: 'error' },
    models: { migrate: 'safe'},
    connections: {
      mongo: {
        module   : 'sails-mongo',
        url      : process.env.MONGO,//'mongodb://travisci:Trav1sC!@candidate.12.mongolayer.com:10300/mybethel',
        schema   : true
      }
    },
    session: {
      module    : 'sails-disk',
    }
  }, done);
});

// Global after hook
after(function (done) {
  console.log();
  sails.lower(done);
});
