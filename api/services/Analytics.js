const moment = require('moment');
const records = new require('elasticsearch').Client(sails.config.elasticsearch);

exports.registerHit = (objectType, objectId, req, properties) => {
  var collection = objectType.split('.');
  var record = {
    object: objectId,
    properties: properties,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    userIp: req.headers['x-forwarded-for'] || req.ip
  };

  if (record.properties.ministry) {
    record.ministry = record.properties.ministry;
    delete record.properties.ministry;
  }

  records.create({
    index: collection[0],
    type: collection[1],
    body: record
  }).then(sails.log.verbose, sails.log.error);

};

exports.generateGraphData = (objectType, objectId, weeksBack) => {
  return new Promise(function(resolve, reject) {
    // TODO: filter only stat rows between start and end date.
    var collection = objectType.split('.');
    records.search({
      index: collection[0],
      type: collection[1],
      body: {
        size: 0,
        query: {
          term: { object: objectId }
        },
        aggs: {
          hits_over_time: {
            date_histogram: {
              field: 'timestamp',
              interval: 'week'
            }
          }
        }
      }
    }).then(function(results) {
      var hits = results.aggregations.hits_over_time.buckets;
      var graphData = {};
      for (var i in hits) {
        graphData[moment(hits[i].key).format('GGGGWW')] = hits[i].doc_count;
      }
      resolve(graphData);
    }, reject);
  });
};
