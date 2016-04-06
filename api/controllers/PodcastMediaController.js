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
    PodcastMedia.findOne(mediaId).populate('podcast').exec(function (err, media) {
      if (err) return res.serverError(err);
      if (!media) return res.notFound();

      Analytics.registerHit('podcast.media', req.param('id'), req, {
        medium: embed ? 'embed' : 'podcast',
        ministry: media.podcast.ministry
      });

      if (media.url.indexOf('cloud.bethel.io') !== -1) {
        // Encode hashtags or question marks in uploaded file names.
        media.url = media.url.replace(/#/g, '%23').replace(/\?/g, '%3F').replace(/\+/g, '%2B');
      }

      if (embed) {
        var embedUrl = (req.query.variant === 'hls' && media.variants && media.variants.hls) ? media.variants.hls : media.url;
        return res.redirect(embedUrl);
      }

      return res.redirect(media.url);
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
  },

  destroy: function(req, res) {
    PodcastMedia.findOne(req.param('id')).exec(function(err, media) {
      if (err) return res.serverError(err);
      if (media.podcast.source === 2) {
        return PodcastMedia.destroy(req.param('id'), function(err) {
          if (err) return res.serverError(err);
          // @TODO: Destroy media stored in S3 if podcast media is hosted on Bethel Cloud
          res.ok();
        });
      }
      PodcastMedia.update(req.param('id'), { deleted: true }).exec(function(err, updated) {
        if (err) return res.serverError(err);
        res.ok(updated);
      });
    });
  }

};
