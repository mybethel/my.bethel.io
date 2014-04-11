var assert = require('assert'),
    Sails = require('sails'),
    request = require('supertest');

// Global before hook
before(function (done) {
  this.timeout(10000);
  // Lift Sails with test database
  Sails.lift({
    log: { level: 'error' },
    connections: {
      mongo: {
        module   : 'sails-mongo',
        url      : 'mongodb://travisci:travisci@baetylus.bethel.io:49156/mybethel-dev',
        schema   : true
      }
    },
    session: {
      adapter    : 'mongo',
      collection : 'sessions',
      url        : 'mongodb://travisci:travisci@baetylus.bethel.io:49156/mybethel-dev'
    }
  }, done);
});

// Global after hook
after(function (done) {
  console.log();
  sails.lower(done);
});
