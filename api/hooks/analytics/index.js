const _ = require('lodash');
const es = require('elasticsearch');

var analytics = new es.Client(Object.assign({}, sails.config.elasticsearch));

module.exports = function AnalyticsHook(sails) {

  this.validate = function(query, req) {
    if (!query.required) {
      return true;
    }

    var missingField, parameters = [];
    _.each(query.required, function(field) {
      if (!req.param(field)) {
        missingField = field;
        return;
      }

      parameters.push(req.param(field));
    });

    return missingField || query.rawQuery.apply(null, parameters);
  };

  return {
    routes: {
      after: {
        'GET /_analytics/:query/:ministryId?': (req, res) => {
          var query;
          try {
            query = require(`./queries/${req.param('query')}`);
          } catch(e) {
            return res.badRequest('unknown query');
          }

          var validQuery = this.validate(query, req);
          if (typeof validQuery !== 'object') {
            return res.badRequest(validQuery);
          }

          var collection = query.index.split('.');
          analytics.search({
            index: collection[0],
            type: collection[1],
            body: validQuery
          }).then(function(records) {
            return query.process(records, res);
          }, function(err) {
            return res.badRequest(err);
          });
        }
      }
    }
  };
};
