#!/usr/bin/env node
var Sails = require('sails');
Sails.load({
  environment: 'production',
  hooks: {
    blueprints: false,
    csrf: false,
    cors: false,
    grunt: false,
    i18n: false,
    request: false,
    responses: false,
    session: false,
    views: false
  },
  log: {
    level: 'verbose'
  }
}, function(err, sails) {
  VimeoStorageSync.sync().then(function() { process.exit(); });
});
