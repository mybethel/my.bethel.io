// Unit Tests: Sails
// ==
// The following sets up a test environment for Sails including lifting and
// lowering the server before and after all tests have been run.
var sails;

// This configuration will override even the `local.js` one. If tests are
// failing locally it may be helpful to temporarily override the log level to
// something other than `silent`.
var config = {
  csrf: false, // @TODO: Should run all unit tests with CSRF protection.
  environment: 'development',
  log: { level: 'silent' },
  models: { migrate: 'drop' },
  session: { adapter: 'memory' }
};

// In Travis, we configure a few additional settings since we don't have a
// `local.js` configuration available. @TODO: it may make sense to move these
// into a dedicated settings file in `config/env`.
if (process.env.TRAVIS) {
  // Mongo and ElasticSearch are configured at the default Travis ports. See
  // [Travis documentation](https://docs.travis-ci.com/user/database-setup/)
  config.connections = {
    mongo: {
      url: 'mongodb://localhost:27017'
    }
  };
  config.elasticsearch = { host: 'localhost:9200' };
}

// Before all tests are run, ensure that the Sails server is lifted and ready.
before(done => {
  require('sails').lift(config, (err, server) => {
    sails = server;
    if (err) return done(err);
    done(err, sails);
  });
});

// Afterwards, lower the Sails instance to clean up.
after(done => sails.lower(done));
