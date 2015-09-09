var CronJob = require('cron').CronJob;

exports.init = function() {

  if (sails.config.cron && sails.config.cron.disabled === true)
    return;

  Cron.create('0 */6 * * * *', function() {
    Machine.create('vimeoSync', 'Standard-1X');
  });

};

exports.create = function(frequency, cb) {
  new CronJob(frequency, cb, null, true, 'America/New_York');
};
