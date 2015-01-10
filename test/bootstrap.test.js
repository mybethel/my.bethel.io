var Sails = require('sails'), sails;

before(function() {
  protractor.promise.controlFlow().execute(function() {

    var deferred = new protractor.promise.Deferred();
    browser.baseUrl = 'http://localhost:1337';

    Sails.lift({
      environment: 'production',
      connections: {
        mongo: {
          adapter: 'sails-mongo',
          url: 'mongodb://localhost:27017'
        }
      },
      log: { level: 'info' },
      migrate: 'drop',
      models: { connection: 'mongo' },
      session: { adapter: 'memory' }
    }, function (err, server) {
      sails = server;
      if (err) return done(err);
      
      deferred.fulfill(true);
    });

    return deferred.promise;
  });
});

after(function() {
  protractor.promise.controlFlow().execute(function() {
    var deferred = new protractor.promise.Deferred();
    sails.lower(function() {
      deferred.fulfill(true);
    });
    return deferred.promise;
  });
});