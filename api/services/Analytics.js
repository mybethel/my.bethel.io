var Keen = require('keen-js'),
    moment = require('moment');

exports.buildPayload = function(req, payload) {
  payload = payload || {};

  payload.ip_address = req.ip,
  payload.user_agent = req.headers['user-agent']

  return payload;
};

exports.registerHit = function(objectType, objectId, properties) {
  var currentDate = Number(moment().format('GGGGWW'));

  var client = new Keen(sails.config.keen);
  client.addEvent(objectType, Analytics.keenParse(properties, objectId), function(err, response) {
    if (err) return sails.log.error('Statistics logging failed to Keen.io', err);
  });

  Stats.findOne({object: objectId, type: objectType, date: currentDate}, function foundStatsTracking(err, stat) {
    if (err) return sails.log.error('Finding stats: ' + err);

    if (!stat) {
      Stats.create({
        date: currentDate,
        count: 1,
        type: objectType,
        object: objectId,
      }, function statsTrackingCreated(err, stat) {
        if (err) return sails.log.error('Creating stats: ' + err);
      })
    } else {
      Stats.update(stat.id, {count: stat.count+1}, function statsUpdated(err) {
        if (err) return sails.log.error('Updating existing stats record: ' + err);
      });
    }
  });
};

exports.keenParse = function(properties, objectId) {
  properties = properties || {};
  properties.keen = { addons: [] };
  properties.object = objectId;

  if (properties.ip_address) {
    properties.keen.addons.push({
      name: 'keen:ip_to_geo',
      input: {
        ip: 'ip_address'
      },
      output: 'ip_geo_info'
    });
  }

  if (properties.user_agent) {
    properties.keen.addons.push({
      name: 'keen:ua_parser',
      input: {
        ua_string: 'user_agent'
      },
      output: 'parsed_user_agent'
    });
  }

  return properties;
}

exports.generateGraphData = function(objectType, objectId, weeksBack) {
  var startDate = Number(moment().subtract(weeksBack, 'week').format('GGGGWW')),
        endDate = Number(moment().format('GGGGWW'));

  // TODO: filter only stat rows between start and end date.
  Stats.find().sort('date asc').where({object: objectId, type: objectType}, function foundStats(err, weeklyStats) {
    if (err) return sails.log.error('Finding stats: ' + err);

    var graphData = new Array();

    weeklyStats.forEach(function(stat) {
      graphData.push(stat.count);
    });

    return graphData;
  });
}
