/**
 * DashboardController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment'),
    ObjectID = require('mongodb').ObjectID;

module.exports = {
	
  dashboard: function (req, res) {
    res.view();
  },

  stats: function(req, res) {
    Podcast.find({ministry: new ObjectID(req.session.Ministry.id)}, function foundPodcasts(err, podcasts) {
      if (err) res.send(err, 500);

      var statistics = {};

      podcasts.forEach(function(podcast) {
        if (podcast.statistics) {
          _.each(podcast.statistics, function(stats, week) {
            statistics[week] = stats;
          });
        }
      });

      var currentWeekAverage = statistics[moment().subtract('week', 1).week()] / 7 || 0;
      var lastWeekAverage = statistics[moment().subtract('week', 2).week()] / 7 || 0;
      var change = ((currentWeekAverage / lastWeekAverage) - 1) * 100;

      res.send({
        podcast: statistics,
        podcastChange: change
      }, 200);
    });
  }

};
