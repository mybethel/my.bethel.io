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

        res.view({
          layout: 'ajax',
          episode: episode,
          podcast: episode.podcast
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

      // Generate statistics data for the analytics graph.
      podcast.statisticsGraph = Analytics.generateGraphData('podcast', req.param('id'), 6);

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
  },

  subscribers: function(req, res) {

    Analytics.generateGraphData('podcast.feed', req.param('id')).then(function(results) {
      var subscribers = 0;
      for (var count in results) {
        subscribers += results[count];
      }
      res.send({
        podcast: req.param('id'),
        subscribers: subscribers,
        historical: results
      });
    }, function(err) {
      sails.log.error(err);
      res.serverError(err);
    });

  },

};
