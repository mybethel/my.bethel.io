var Sails = require('sails'), sails;

before(function (done) {
  Sails.lift({
    environment: 'development',
    connections: {
      mongo: {
        adapter: 'sails-mongo',
        url: 'mongodb://localhost:27017'
      }
    },
    elasticsearch: {
      host: 'localhost:9200'
    },
    log: { level: 'info' },
    models: {
      migrate: 'drop',
      connection: 'mongo'
    },
    session: { adapter: 'memory' }
  }, function (err, server) {
    sails = server;
    if (err) return done(err);
    done(err, sails);
  });
});

after(function (done) {
  sails.lower(done);
});
