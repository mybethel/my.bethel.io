/**
 * PodcastController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

const moment = require('moment');

module.exports = {

  embed: function (req, res) {
    if (!req.param('type') || !req.param('id'))
      return res.badRequest('type and id are required');

    if (req.param('type') === 'episode') {
      PodcastMedia.findOne(req.param('id')).populate('podcast').exec(function (err, episode) {
        if (!episode)
          return res.notFound('episode not found');

        episode.podcast.type = (episode.podcast.type === 1) ? 'audio' : 'video';
        episode.url = episode.url.replace('http://cloud.bethel.io', 'https://s3.amazonaws.com/cloud.bethel.io');

        var background, embedStyles = '';
        var podcast = episode.podcast;

        if (podcast.type === 'video') {
          background = 'background:#000';
        } else if (podcast.embedSettings && podcast.embedSettings.backgroundColor) {
          background = 'background:' + podcast.embedSettings.backgroundColor;
        } else {
          background = 'background-image:url(https://images.bethel.io/images/' + (podcast.image ? podcast.image : 'DefaultPodcaster.png') + '?crop=faces&fit=crop&w=200&h=200&blur=150);'
        }

        if (background) {
          embedStyles += '#embedded.vjs-bethel-skin{' + background + '}';
        }

        if (podcast.embedSettings) {
          if (podcast.embedSettings.textColor) {
            embedStyles += '.meta,.meta small,.extras a{color:' + podcast.embedSettings.textColor + ';}';
          }

          if (podcast.embedSettings.controlColor) {
            embedStyles += '.video-js.vjs-bethel-skin{color:' + podcast.embedSettings.controlColor + ';}';
            embedStyles += '.video-js.vjs-bethel-skin .vjs-progress-control .vjs-play-progress,.video-js.vjs-bethel-skin .vjs-volume-level,.video-js.vjs-bethel-skin .vjs-mouse-display,.video-js.vjs-bethel-skin .vjs-mouse-display:after'
            embedStyles += '{background:' + podcast.embedSettings.controlColor + '}'
          }

          if (podcast.embedSettings.sliderColor) {
            embedStyles += '.video-js.vjs-bethel-skin .vjs-progress-control .vjs-progress-holder{background:' + podcast.embedSettings.sliderColor + '}';
          }
        }

        var posterImage = episode.thumbnail ? episode.thumbnail :
          `https://images.bethel.io/images/${ podcast.image ? podcast.image : 'DefaultPodcaster.png' }?crop=faces&fit=crop&w=140&h=140`;

        res.view({
          layout: 'none',
          episode: episode,
          podcast: podcast,
          posterImage: posterImage,
          embedStyles: embedStyles
        });
      });
    }
  },

  list: function (req, res) {
    if (!req.param('id') && typeof req.session.ministry === 'undefined')
      return res.badRequest('ministry id required');

    var ministryId = (req.param('id')) ? req.param('id') : req.session.ministry;
    var query = Podcast.find({ ministry: ministryId });

    if (req.param('episodes'))
      query.populate('media', { sort: { date: 0 } });

    query.exec(function (err, podcasts) {
      if (err) return next(err);
      res.send(podcasts);
    });
  },

  new: function (req, res) {
    res.send(S3Upload.prepare('images/podcast/tmp'));
  },

  edit: function (req, res) {
    Podcast.findOne(req.param('id')).populate('media').populate('service').exec(function foundPodcast(err, podcast) {
      if (err || !podcast || !podcast.id) return next(err);

      var uploadForm = S3Upload.prepare('images/podcast/tmp');
      Podcast.subscribe(req, podcast.id);

      Service.find({ provider: 'vimeo', ministry: req.session.ministry }, function foundServices(err, services) {
        res.send({
          s3form: uploadForm,
          uploadEpisode: S3Upload.prepare('podcast/' + podcast.ministry + '/' + podcast.id),
          podcast: podcast,
          services: services
        });
      });
    });
  },

  destroy: function(req, res) {
    Podcast.destroy(req.param('id'), function deletedPodcast(err) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      // @TODO: Destroy media stored in S3 if podcast media is hosted on Bethel Cloud
      PodcastMedia.destroy({ podcast: req.param('id') }, function deletedPodcastMedia(err) {
        if (err) sails.log.error(err);

        res.redirect('/#/podcast');
      });
    });
  },

  show: function (req, res) {
    Podcast.findOne(req.param('id')).populate('ministry').populate('media', { sort: { date: 0 } }).exec(function (err, podcast) {
      if (err) return next(err);

      // Verify that the user has access to view this page.
      if (podcast.ministry.id !== req.session.ministry)
        return res.forbidden('You must be a member of the ministry to edit this podcast.');

      // If this is an audio podcast show the upload form.
      if (podcast.type === 1) {
        podcast.s3form = S3Upload.prepare('podcast/' + podcast.ministry.id + '/' + podcast.id);
      }

      res.view({
        podcast: podcast,
        ministry: podcast.ministry,
        podcastMedia: podcast.media
      });
    });
  },

  feed: function (req, res) {
    Podcast.findOne(req.param('id')).populate('ministry').populate('media', { sort: { date: 0 } }).exec(function (err, podcast) {
      if (err) return res.serverError(err);
      if (!podcast) return res.notFound();

      Analytics.registerHit('podcast.feed', req.param('id'), req, {
        ministry: podcast.ministry.id
      });

      res.header('Content-Type', 'text/xml; charset=UTF-8');

      return res.view({
        layout: 'rss',
        podcast: podcast,
        ministry: podcast.ministry,
        podcastMedia: podcast.media
      });
    });
  }

};
