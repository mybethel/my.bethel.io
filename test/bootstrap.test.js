var Sails = require('sails'), sails;

before(function (done) {
  protractor.promise.controlFlow().execute(function() {

    var deferred = new protractor.promise.Deferred();
    browser.baseUrl = 'http://localhost:1337';

    Sails.lift({
      connections: {
        disk: { adapter: 'sails-disk' }
      },
      environment: 'production',
      //log: { level: 'error' },
      session: { adapter: 'memory' }
    }, function (err, server) {
      sails = server;
      if (err) return done(err);
      // Fixture loading.
      deferred.fulfill(true);
    });

    return deferred.promise;
  });
});

after(function (done) {
  sails.lower(done);
});