// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

// When running in Production, New Relic is used for application performance
// monitoring. This will load and use the configuration file at `./newrelic.js`
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// Grunt is disabled in Production in order to ensure Sails lifts quickly.
// The appropriate Grunt task will run during the Heroku build phase.
require('sails').lift({ grunt: process.env.NODE_ENV !== 'production' });
