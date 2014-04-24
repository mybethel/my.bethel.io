
exports.init = function(options) {
  
  var s3Sync = require('cron').CronJob;

  new s3Sync('0 */5 * * * *', function() {
    S3StorageSync.sync();
  }, null, true, 'America/New_York');

  var vimeoSync = require('cron').CronJob;

  new vimeoSync('0 */6 * * * *', function() {
    VimeoStorageSync.sync();
  }, null, true, 'America/New_York');

}