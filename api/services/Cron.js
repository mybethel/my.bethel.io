
exports.init = function(options) {

  if (sails.config.cron && sails.config.cron.disabled === true)
    return;

  var vimeoSync = require('cron').CronJob;

  new vimeoSync('0 */6 * * * *', function() {
    VimeoStorageSync.sync();
  }, null, true, 'America/New_York');

};
