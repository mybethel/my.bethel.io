var moment = require('moment');

exports.registerHit = function(objectType, objectId) {
  var currentDate = Number(moment().year() +''+ moment().week());

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
}

exports.generateGraphData = function(objectType, objectId, weeksBack) {
  var startDate = Number(moment().year() +''+ moment().subtract('week', weeksBack).week()),
        endDate = Number(moment().year() +''+ moment().week());

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
