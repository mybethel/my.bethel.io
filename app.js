/**
 * app.js
 *
 * To start the server, run: `node app.js`.
 */

var sails, rc;
try {
  sails = require('sails');
  rc = require('rc');
}
catch (e) {
  console.error('The Sails dependency was not found. Exiting.');
  return;
}

var config = rc('sails');

if (config.prod) {
  // Grunt is disabled in Production in order to ensure Sails lifts quickly.
  // The appropriate Grunt task will run during the Heroku build phase.
  config.hooks = { grunt: false };
}

// Start server
sails.lift(config);
