const request = require('request');
const moment = require('moment');

/**
 * @class Parses through the CDN logs to determine usage for billing purposes.
 * This worker is run every 24 hours on the previous days' logs. Currently, logs
 * are sent from KeyCDN to LogEntries where they are retained for 7 days.
 * @private
 * @memberof Worker
 */
function CDNUsage() {
  this.hostname = 'https://pull.logentries.com';
  this.usage = {};

  /**
   * KeyCDN sends logs separated by pipes. This array is used to split the raw
   * logs into an object which allows for a bit more readable code.
   * @see {@link https://www.keycdn.com/support/cdn-log-format/|KeyCDN Log Format}
   */
  this.field = ['timestamp', 'pop', 'clientIp', 'statusCode', 'bytes', 'userId',
                'zoneId', 'zoneUrl', 'cache', 'request', 'date', 'referrer',
                'agent', 'scheme', 'countryCode', 'countryName', 'city',
                'region', 'latitude', 'longitude', 'organization'];
}

/**
 * Splits the raw log entry into an object based on the defined field names.
 * @param {String} logEntry The raw log entry from KeyCDN.
 */
CDNUsage.prototype.standardize = function(logEntry) {
  var fields = logEntry.split('|');
  var standardized = {};
  for (var i = 0; i < this.field.length; i++) {
    standardized[this.field[i]] = fields[i];
  }
  return standardized;
};

/**
 * Parses out the ministry and total usage from the log entry and increments the
 * usage object for the appropriate ministry. Currently only podcast file
 * transfer is supported and other entries will be ignored.
 * @param {Object} stat A log entry which has been parsed and standardized.
 */
CDNUsage.prototype.logStat = function(stat) {
  if (stat.request.indexOf('/podcast') === -1) {
    return;
  }

  var requestInfo = stat.request.split('/');
  var ministry = requestInfo[2];
  var podcast = requestInfo[3];

  if (this.usage[ministry]) {
    return this.usage[ministry] += Number(stat.bytes);
  }

  this.usage[ministry] = Number(stat.bytes);
};

/**
 * Main machine operation: queries the CDN logs for the previous 24 hours worth
 * of logs based on UTC time. These are returned as JSON and parsed into the raw
 * bytes used by each ministry. Finally, these are saved as Invoice rows.
 */
CDNUsage.prototype.run = function(cb, daysAgo) {
  var pullUrl = `${this.hostname}/${sails.config.log.logentries}/hosts/bethel/keycdn/`;

  var day = moment().utc().subtract(daysAgo || 1, 'days');
  var start = day.hours(0).minutes(0).seconds(0).valueOf();
  var end = day.hours(23).minutes(59).seconds(59).valueOf();

  sails.log.info(`Checking CDN usage for ${day.format()}`)

  request(`${pullUrl}?start=${start}&end=${end}&format=json`, (err, res, stats) => {

    stats = JSON.parse(stats);
    for (var i = 0; i < stats.length; i++) {
      var stat = this.standardize(stats[i].m);
      this.logStat(stat);
    }

    sails.log.info(this.usage);

    var invoices = [];
    for (var ministry in this.usage) {
      invoices.push({
        ministry: ministry,
        type: 'podcast',
        units: this.usage[ministry]
      });
    }

    Invoice.create(invoices).exec(cb);

  });
};

module.exports = new CDNUsage();
