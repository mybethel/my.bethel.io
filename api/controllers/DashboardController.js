/**
 * DashboardController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment');

module.exports = {
	
  dashboard: function (req, res) {
    res.view();
  },

  stats: function(req, res) {
    Podcast.find({ministry: req.session.Ministry.id}, function foundPodcasts(err, podcasts) {
      if (err) res.send(err, 500);

      var allPodcasts = [],
          storageBytes = 0;

      podcasts.forEach(function(podcast) {
        allPodcasts.push({object: podcast.id});
        if (podcast.storage > 0)
          storageBytes += podcast.storage;
      });

      Stats.find().where({or: allPodcasts}).sort('date').exec(function foundStats(err, weeklyStats) {
        if (err) res.send(err, 500);

        var statistics = {};

        weeklyStats.forEach(function(stat) {
          statistics[stat.date] = statistics[stat.date] ? statistics[stat.date] + stat.count : stat.count;
        });

        var currentWeekAverage = statistics[moment().subtract('week', 1).format('GGGGWW')] / 7 || 0,
            lastWeekAverage = statistics[moment().subtract('week', 2).format('GGGGWW')] / 7 || 0,
            change = ((currentWeekAverage / lastWeekAverage) - 1) * 100;

        res.send({
          podcast: statistics,
          podcastChange: change,
          storage: storageBytes / 1073741824 || 0
        }, 200);
      });
    });
  }

};
