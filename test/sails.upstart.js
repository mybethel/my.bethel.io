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
        host     : 'baetylus.bethel.io:49156',
        user     : 'travisci',
        password : 'travisci',
        database : 'mybethel-dev',
        schema   : true
      }
    },
    session: {
      adapter    : 'mongo',
      host       : 'baetylus.bethel.io:49156',
      user       : 'travisci',
      password   : 'travisci',
      db         : 'mybethel-dev',
      collection : 'sessions',
    }
  }, done);
});

// Global after hook
after(function (done) {
  console.log();
  sails.lower(done);
});
