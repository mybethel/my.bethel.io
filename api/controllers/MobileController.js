/**
 * MobileController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  tvos: function(req, res) {
    Ministry.find().exec(function (err, results) {
      res.view({
        layout: 'none',
        ministries: results
      });
    });
  },

  detail: function(req, res) {
    Ministry.find(req.param('id')).exec(function (err, results) {
      res.view({
        layout: 'none',
        ministry: results[0]
      });
    });
  },

  channel: function(req, res) {
    var query = req.param('id') || {
      name: {
        contains: req.query.search
      }
    };

    Ministry.find(query).exec(function (err, results) {

      // Search results only need the ministry object.
      if (!req.param('id')) {
        res.view('mobile/partials/results', {
          layout: 'none',
          ministries: results,
          term: req.query.search
        });
        return;
      }

      function noMediaResponse() {
        res.view({
          layout: 'none',
          ministry: results[0]
        });
      }

      PlaylistBuilder.find(query).then(function(playlistId) {
        PlaylistBuilder.from(playlistId).then(function(playlist) {

          var episodes = []
          for (var i = 0; i < 10; i++) {
            if (playlist.media[i].type === 'video') {
              episodes.push(playlist.media[i]);
            } else if (playlist.media[i].video) {
              episodes.push(playlist.media[i].video);
            }
          }

          var series = []
          for (var i = 0; i < 10; i++) {
            if (playlist.media[i].media) {
              series.push(playlist.media[i]);
            }
          }

          res.view({
            layout: 'none',
            ministry: results[0],
            episodes: episodes,
            series: series
          });
        }, noMediaResponse);
      }, noMediaResponse);

    });
  }

};
