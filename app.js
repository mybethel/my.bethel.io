/**
 * app.js
 *
 * To start the server, run: `node app.js`.
 */

require('newrelic');

var sails, rc;
try {
	sails = require('sails');
	rc = require('rc');
}
catch (e) {
	console.error('The Sails dependency was not found. Exiting.');
	return;
}

// Start server
sails.lift(rc('sails'));
