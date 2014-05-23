/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // Setup the 2dsphere index on Locations collection.
  Location.native(function(err, collection) {
    collection.ensureIndex({
      loc: '2dsphere'
    }, function(err, result) {
      return;
    });
  });

  // Ensure all Cron jobs are scheduled to run.
  Cron.init();

  // Setup Passport services.
  var passport = require('passport')
    , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

  for (var service in sails.config.services) {
    passport.use(service, new OAuth2Strategy(sails.config.services[service],
      function(accessToken, refreshToken, profile, done) {
        Services.findOrCreate({
          'ministry': req.session.Ministry.id,
          'provider': service
        }, {
          'provider': service,
          'ministry': req.session.Ministry.id,
          'accessToken': accessToken,
          'refreshToken': refreshToken,
          'profile': profile
        }, function(err, user) {
          if (err)
            sails.log.error(err);

          done(null, user);
        });
      }
    ));
  }

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};