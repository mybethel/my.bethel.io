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

  stat: function(req, res) {
    var statistics = Analytics.buildPayload(req, {
      medium: 'embed'
    });
    Analytics.registerHit('podcastmedia', req.param('id'), statistics);
    res.ok(req.param('id'));
  },

  refresh: function(req, res) {
    Machine.create('vimeoSync', 'Hobby');
    res.send(200);
  },

  related: function(req, res) {
    PodcastMedia.find({referenceId: req.param('id')}).sort('date desc').exec(function foundPodcastMedia(err, media) {
      res.send(200, media);
    });
  },

  meta: function (req, res) {

    PodcastMedia.findOne(req.param('id')).exec(function (err, media) {

      if (typeof media === 'undefined' || typeof media.url === 'undefined')
        return res.serverError('Unable to locate media.');

      VideoEncoding.getMetadata(media.url, media.podcast.ministry, function (jobDetails) {
        PodcastMedia.update(req.param('id'), {
          duration: parseInt(jobDetails.input_media_file.duration_in_ms / 1000)
        }, function mediaUpdated(err) {
          if (err)
            sails.log.error(err);

          return res.send(jobDetails);
        });
      });
    });
  }

};
