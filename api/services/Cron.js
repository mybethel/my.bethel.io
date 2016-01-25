var CronJob = require('cron').CronJob;

exports.init = function() {

  if (sails.config.cron && sails.config.cron.disabled === true)
    return;

  // Sync all Vimeo podcasts every 6 minutes.
  Cron.create('0 */6 * * * *', function() {
    Machine.create('vimeoSync', 'Standard-1X');
  });

  // Parse CDN logs and generate invoices every day at 1:00AM.
  Cron.create('00 00 01 * * *', function() {
    if (!sails.config.log.logentries) return;
    Machine.create('cdnUsage', 'Standard-1X');
  });

};

exports.create = function(frequency, cb) {
  new CronJob(frequency, cb, null, true, 'America/New_York');
};
