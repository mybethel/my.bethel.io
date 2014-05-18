var moment = require('moment');

exports.registerHit = function(objectType, objectId) {
  var currentDate = Number(moment().year() +''+ moment().week());
         objectId = objectId.slice(-7);

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
