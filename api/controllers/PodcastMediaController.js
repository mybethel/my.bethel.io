/**
 * PodcastMediaController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  download: function(req, res) {
    var embed = (typeof req.query.embed !== 'undefined');
    var mediaId = req.param('id').split('.').shift();
    PodcastMedia.findOne(mediaId).exec(function (err, media) {
      if (err) return res.serverError(err);
      if (!media) return res.notFound();

      var statistics = Analytics.buildPayload(req, {
        medium: embed ? 'embed' : 'podcast'
      });
      Analytics.registerHit('podcastmedia', req.param('id'), statistics);

      if (media.url.indexOf('cloud.bethel.io') !== -1) {
        // Encode hashtags or question marks in uploaded file names.
        media.url = media.url.replace(/#/g, '%23').replace(/\?/g, '%3F').replace(/\+/g, '%2B');
      }

      if (embed) {
        return res.redirect(media.url);
      }

      res.header('Content-Disposition', 'attachment');
      return require('request').get(media.url).pipe(res);
    });
  },

  subscribe: function(req, res) {
    PodcastMedia.find(function foundPodcast(err, media) {
      if (err) return next(err);

      PodcastMedia.watch(req.socket);
      PodcastMedia.subscribe(req.socket, media);

      res.send(200);
    });
  },

  refresh: function(req, res) {
    Machine.create('vimeoSync', 'Standard-1X');
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
