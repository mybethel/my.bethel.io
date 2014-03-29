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
    PodcastMedia.update(req.param('id'), req.params.all(), function podcastUpdated(err, updatedMedia) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcastmedia/edit/' + req.param('id'));
      }
      req.session.flash = {};

      updatedMedia.forEach(function(media) {
        PodcastMedia.publishUpdate(media.id, {
          name: media.name,
          date: media.date,
          description: media.description,
          url: media.url
        });
      });

      return res.redirect('/podcastmedia/edit/' + req.param('id'));
    })
  },

  subscribe: function(req, res) {
    PodcastMedia.find(function foundPodcast(err, media) {
      if (err) return next(err);

      PodcastMedia.watch(req.socket);
      PodcastMedia.subscribe(req.socket, media);

      res.send(200);
    });
  },

  row: function(req, res) {
    PodcastMedia.findOne(req.param('id'), function foundPodcast(err, media) {
      if (err) return next(err);
    
      res.view({
        media: media,
        layout: 'ajax'
      });
    });
  },

  refresh: function(req, res) {
    S3StorageSync.sync();
    res.send(200);
  },

  related: function(req, res) {
    PodcastMedia.find({referenceId: req.param('id')}).sort('date desc').exec(function foundPodcastMedia(err, media) {
      res.send(200, media);
    });
  }
	
};
