/**
 * PodcastController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
const request = require('request');

module.exports = {

  embed: function(req, res) {
    if (!req.param('type') || !req.param('id'))
      return res.badRequest('type and id are required');

    res.redirect(`https://embed.bethel.io/${req.param('id')}`);
  },

  // This route is in use by the Wordpress plugin to provide embedable players.
  list: function(req, res) {
    if (!req.param('id') && typeof req.session.ministry === 'undefined')
      return res.badRequest('ministry id required');

    var ministryId = (req.param('id')) ? req.param('id') : req.session.ministry;
    var query = Podcast.find({ ministry: ministryId });

    if (req.param('episodes'))
      query.populate('media', { sort: { date: 0 } });

    query.exec(function(err, podcasts) {
      if (err) return next(err);
      res.send(podcasts);
    });
  },

  new: function (req, res) {
    res.send(S3Upload.prepare('images/podcast/tmp'));
  },

  edit: function(req, res) {
    Podcast.findOne(req.param('id')).populate('media', { deleted: { '!': true } }).populate('service').exec(function foundPodcast(err, podcast) {
      if (err) return res.serverError(err);
      if (!podcast || !podcast.id) return res.notFound();

      var uploadForm = S3Upload.prepare('images/podcast/tmp');
      Podcast.subscribe(req, podcast.id);

      Service.find({ provider: 'vimeo', ministry: req.session.ministry }, function foundServices(err, services) {
        if (err) return res.serverError(err);
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
    Podcast.findOne(req.param('id')).populate('media').exec(function(err, podcast) {
      if (err) return res.serverError(err);
      if (podcast.source === 1 && !podcast.media.length) {
        return Podcast.destroy(req.param('id')).exec(function(err) {
          if (err) return res.serverError(err);
          res.ok();
        });
      }
      Podcast.update(req.param('id'), { deleted: true }, function(err, updated) {
        if (err) return res.serverError(err);
        return res.ok(updated);
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

  feed: function(req, res) {
    Podcast.findOne(req.param('id')).populate('ministry').populate('media', { deleted: { '!': true } }, { sort: { date: 0 } }).exec(function(err, podcast) {
      if (err) return res.serverError(err);
      if (!podcast) return res.notFound();

      request({
        method: 'post',
        body: {
          collection: 'podcast',
          podcast: req.param('id'),
          ministry: podcast.ministry.id,
          ip_address: req.headers['x-forwarded-for'] || req.ip,
          user_agent: req.headers['user-agent'],
        },
        json: true,
        url: 'https://api.bethel.io/performance/track',
      }, function(err) {
        if (err) {
          sails.log.error(err);
        }
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
