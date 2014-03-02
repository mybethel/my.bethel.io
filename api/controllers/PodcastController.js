/**
 * PodcastController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  list: function (req, res) {
    Podcast.find({ministry: req.session.Ministry.id}, function foundPodcasts(err, podcasts) {
      if (err) return next(err);

      res.view({
        podcasts: podcasts
      });
    });
  },

  new: function (req, res) {
    res.view();
  },

  create: function (req, res) {
    Podcast.create(req.params.all(), function podcastCreated(err, podcast) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcast/new');
      }
      req.session.flash = {};

      return res.redirect('/podcasts');
    });
  },
	
};
