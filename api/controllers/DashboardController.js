/**
 * DashboardController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  dashboard: function (req, res) {
    res.view();
  },

  stats: function(req, res) {
    if (!req.session.Ministry)
      return res.forbidden('Your account is not associated with a ministry.');

    Podcast.find({ministry: req.session.Ministry.id}, function foundPodcasts(err, podcasts) {
      if (err) res.send(err, 500);

      var allPodcasts = [],
          storageBytes = 0;

      if (podcasts && podcasts.length > 0) {
        podcasts.forEach(function(podcast) {
          allPodcasts.push({object: podcast.id});
          if (podcast.storage > 0)
            storageBytes += podcast.storage;
        });
      }

      Media.find({ministry: req.session.Ministry.id}, function foundPodcasts(err, media) {

        if (media && media.length > 0) {
          media.forEach(function(media) {
            if (media.size > 0)
              storageBytes += media.size;
          });
        }

        Stats.find().where({or: allPodcasts}).sort('date').exec(function foundStats(err, weeklyStats) {
          if (err) res.send(err, 500);

          var statistics = [];

          // Select up to the last 12 weeks of stats for trending.
          weeklyStats.slice(-12).forEach(function(stat) {
            statistics.push(statistics[stat.date] ? statistics[stat.date] + stat.count : stat.count);
          });

          var currentWeekAverage = statistics[statistics.length - 1] / 7 || 0,
              lastWeekAverage = statistics[statistics.length - 2] / 7 || 0,
              change = ((currentWeekAverage / lastWeekAverage) - 1) * 100;

          res.send({
            podcast: statistics,
            podcastChange: change,
            storage: storageBytes / 1073741824 || 0
          });
        });
      });
    });
  }

};
