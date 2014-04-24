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

var s3Sync = require('cron').CronJob;

new s3Sync('0 */5 * * * *', function() {
  S3StorageSync.sync();
}, null, true, 'America/New_York');

var vimeoSync = require('cron').CronJob;

new vimeoSync('0 */6 * * * *', function() {
  VimeoStorageSync.sync();
}, null, true, 'America/New_York');

// Start server
sails.lift(rc('sails'));
