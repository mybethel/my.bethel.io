/**
 * PodcastMediaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  edit: function (req, res) {
    PodcastMedia.findOne(req.param('id'), function foundPodcast(err, media) {
      if (err) return next(err);
    
      res.view({
        media: media,
        layout: 'ajax'
      });
    });
  },

  update: function(req, res) {
    PodcastMedia.update(req.param('id'), req.params.all(), function podcastUpdated(err) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcastmedia/edit/' + req.param('id'));
      }
      req.session.flash = {};

      return res.redirect('/podcastmedia/edit/' + req.param('id'));
    })
  }
	
};
