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
          ministries: results
        });
        return;
      }

      PodcastMedia.find({ url: { contains: '.mp4' }}).limit(10).exec(function (err, allMedia) {
        res.view({
          layout: 'none',
          ministry: results[0],
          episodes: allMedia
        });
      });
    });
  }

};
