const includeAll = require('include-all');

var fixtures = includeAll({
  dirname: require('path').resolve(__dirname, 'fixtures'),
  filter: /(.+)\.js$/
}) || {};

module.exports = fixtures;
