if (process.env.NEW_RELIC_LICENSE_KEY) {
  var newrelic = require('newrelic');
  module.exports.newrelic = newrelic;
}
