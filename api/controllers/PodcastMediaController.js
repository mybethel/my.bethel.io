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
	
};
