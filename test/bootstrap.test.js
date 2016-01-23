var Sails = require('sails'), sails;

beforeAll(function() {
  protractor.promise.controlFlow().execute(function() {

    var deferred = new protractor.promise.Deferred();
    browser.baseUrl = 'http://localhost:1337/';

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
      log: { level: 'warn' },
      models: {
        migrate: 'drop',
        connection: 'mongo'
      },
      session: { adapter: 'memory' }
    }, function (err, server) {
      sails = server;
      if (err) return deferred.reject(err);

      setTimeout(function(){ deferred.fulfill(true); }, 5000);
    });

    return deferred.promise;
  });
});

afterAll(function() {
  protractor.promise.controlFlow().execute(function() {
    var deferred = new protractor.promise.Deferred();
    sails.lower(function() {
      deferred.fulfill(true);
    });
    return deferred.promise;
  });
});
