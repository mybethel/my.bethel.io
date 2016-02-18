const _ = require('lodash');
const moment = require('moment');

module.exports = {
  index: 'podcast.feed',
  process: function(records, res) {
    var results = {}, subscribers = 0;
    _.each(records.aggregations.hits_over_time.buckets, function(hits) {
      results[moment(hits.key).format('GGGGWW')] = hits.doc_count;
      subscribers += hits.doc_count;
    });

    res.send({
      podcast: this.uuid,
      subscribers: subscribers,
      historical: results
    });
  },
  required: ['uuid'],
  rawQuery: function(objectId) {
    // TODO: filter only stat rows between start and end date.
    return {
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
    };
  }
};
