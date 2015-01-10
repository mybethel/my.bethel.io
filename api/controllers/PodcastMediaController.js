/**
 * PodcastMediaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  subscribe: function(req, res) {
    PodcastMedia.find(function foundPodcast(err, media) {
      if (err) return next(err);

      PodcastMedia.watch(req.socket);
      PodcastMedia.subscribe(req.socket, media);

      res.send(200);
    });
  },

  refresh: function(req, res) {
    S3StorageSync.sync();
    VimeoStorageSync.sync(true);
    res.send(200);
  },

  related: function(req, res) {
    PodcastMedia.find({referenceId: req.param('id')}).sort('date desc').exec(function foundPodcastMedia(err, media) {
      res.send(200, media);
    });
  }
	
};
