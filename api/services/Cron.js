const CronJob = require('cron').CronJob;

exports.init = function() {
  if (sails.config.cron && sails.config.cron.disabled === true || process.env.CRON_DISABLE)
    return;

  // Sync all Vimeo podcasts every 6 minutes.
  Cron.create('0 */6 * * * *', function() {
    VimeoStorageSync.sync();
  });
};

exports.create = function(frequency, cb) {
  new CronJob(frequency, cb, null, true, 'America/New_York');
};
