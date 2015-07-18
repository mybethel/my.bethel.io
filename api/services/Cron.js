
exports.init = function(options) {

  if (sails.config.cron && sails.config.cron.disabled === true)
    return;

  var Heroku = require('heroku-client'),
      heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN }).apps(process.env.HEROKU_APP);

  var Cron = require('cron').CronJob;

  new Cron('0 */6 * * * *', function() {
    heroku.dynos().create({
      command: './workers/vimeoSync.js',
      size: '1X',
    });
  }, null, true, 'America/New_York');

};
