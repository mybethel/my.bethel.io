var assert = require('assert'),
    Sails = require('sails'),
    request = require('supertest');

// Global before hook
before(function (done) {
  this.timeout(5000);
  // Lift Sails with test database
  Sails.lift({
    log: { level: 'info' },
    connections: {
      mongo: {
        module   : 'sails-mongo',
        host     : 'baetylus.bethel.io:49156',
        user     : 'travisci',
        password : 'travisci',
        database : 'mybethel-dev',
        schema   : true
      }
    }
  }, done);
});

// Global after hook
after(function (done) {
  console.log();
  sails.lower(done);
});
