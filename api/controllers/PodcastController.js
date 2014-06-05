/**
 * PodcastController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var moment = require('moment'),
    xml2js = require('xml2js'),
    request = require('request'),
    ObjectID = require('mongodb').ObjectID;

module.exports = {

  list: function (req, res) {
    Podcast.find({ministry: new ObjectID(req.session.Ministry.id)}, function foundPodcasts(err, podcasts) {
      if (err) return next(err);

      res.view({
        podcasts: podcasts
      });
    });
  },

  new: function (req, res) {
    uploadForm = S3Upload.prepare('images/podcast/tmp');

    Services.find({provider: 'vimeo', ministry: new ObjectID(req.session.Ministry.id)}, function foundServices(err, services) {
      res.view({
        s3form: uploadForm,
        services: services
      });
    });
  },

  create: function (req, res) {
    Podcast.create(req.params.all(), function podcastCreated(err, podcast) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcast/new');
      }
      req.session.flash = {};

      return res.redirect('/podcast/show/' + podcast.id);
    });
  },

  import: function(req, res) {
    if (!req.param('url'))
      return res.send(403, 'no feed provided');

    request(req.param('url'), function (error, response, body) {
      if (error || response.statusCode !== 200)
        return res.send(503, 'unable to load feed');

      xml2js.parseString(body, function (err, result) {
        // Ensure the XML feed has at least one item to import.
        if (err || !result.rss.channel[0].item || result.rss.channel[0].item.length < 1)
          return res.send(503, 'invalid feed');

        var mediaUrl = result.rss.channel[0].item[0]['enclosure'][0]['$']['url'];
        var podcastImage = result.rss.channel[0]['itunes:image'][0]['$']['href'];
        var podcastImageFileName = podcastImage.split('/').slice(-1);
        var mediaType = 2;

        // Determine the type of podcast from the first enclosure URL.
        // @todo: this needs to be more flexible
        if (mediaUrl.indexOf('.mp3') !== -1 || mediaUrl.indexOf('.m4a') !== -1)
          mediaType = 1;

        // Upload the podcast thumbnail to S3 and create the Podcast entry.
        S3Upload.transport(podcastImage, 'images/podcast/tmp', podcastImageFileName, function (err) {
          if (err)
            return res.send(503, 'unable to copy image');

          Podcast.create({
            name: result.rss.channel[0]['title'],
            type: mediaType,
            source: 1,
            sourceMeta: 'importing',
            description: result.rss.channel[0]['description'],
            tags: result.rss.channel[0]['itunes:keywords'],
            copyright: result.rss.channel[0]['copyright'],
            ministry: new ObjectID(req.session.Ministry.id),
            temporaryImage: podcastImageFileName,
          }, function podcastCreated(err, podcast) {
            res.send(200, podcast.id);
          });
        });
      });
    });
  },

  edit: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      uploadForm = S3Upload.prepare('images/podcast/tmp');
    
      Services.find({provider: 'vimeo', ministry: new ObjectID(req.session.Ministry.id)}, function foundServices(err, services) {
        res.view({
          s3form: uploadForm,
          podcast: podcast,
          services: services
        });
      });
    });
  },

  update: function(req, res) {
    Podcast.update(req.param('id'), req.params.all(), function podcastUpdated(err) {
      if (err) {
        req.session.flash = {
          err: err
        }

        return res.redirect('/podcast/edit/' + req.param('id'));
      }
      req.session.flash = {};

      return res.redirect('/podcast/show/' + req.param('id'));
    });
  },

  delete: function(req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      res.view({
        podcast: podcast,
        layout: req.viewData.layout
      });
    });
  },

  destroy: function(req, res) {
    Podcast.destroy(req.param('id'), function deletedPodcast(err, podcast) {
      if (err) sails.log.error(err);

      PodcastMedia.destroy({podcast: req.param('id')}, function deletedPodcastMedia(err, podcastMedia) {
        if (err) sails.log.error(err);

        res.redirect('/podcasts');
      });

    });
  },

  show: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) return next(err);

      Ministry.findOne(podcast.ministry, function foundMinistry(err, ministry) {
        if (err) return next(err);

        PodcastMedia.find().sort('date desc').where({podcast: new ObjectID(podcast.id)}).exec(function(err, media) {
          if (err) return next(err);

          if (podcast.type == 1) {
            podcast.s3form = S3Upload.prepare('podcast/' + podcast.ministry + '/' + podcast.id);
          }

          podcast.statisticsGraph = Analytics.generateGraphData('podcast', req.param('id'), 6);

          // DEPRECATED: Remove once old data has been migrated to new storage.
          if (!podcast.statisticsGraph && podcast.statistics && Object.keys(podcast.statistics).length >= 4) {
            podcastGraph = new Array();
            if (Object.keys(podcast.statistics).length >= 6) {
              podcastGraph.push(podcast.statistics[moment().subtract('week', 6).week()]);
              podcastGraph.push(podcast.statistics[moment().subtract('week', 5).week()]);
            }
            podcastGraph.push(podcast.statistics[moment().subtract('week', 4).week()]);
            podcastGraph.push(podcast.statistics[moment().subtract('week', 3).week()]);
            podcastGraph.push(podcast.statistics[moment().subtract('week', 2).week()]);
            podcastGraph.push(podcast.statistics[moment().subtract('week', 1).week()]);
            podcast.statisticsGraph = podcastGraph.filter(Number);
          }
          // END DEPRECATED.

          res.view({
            podcast: podcast,
            ministry: ministry,
            podcastMedia: media
          });
        });
      });
    });
  },

  feed: function (req, res) {
    Podcast.findOne(req.param('id'), function foundPodcast(err, podcast) {
      if (err) res.send(err, 500);
      if (!podcast) res.send(404);

      Ministry.findOne(podcast.ministry, function foundMinistry(err, ministry) {
        if (err) res.send(err, 500);

        PodcastMedia.find().sort('date desc').where({podcast: new ObjectID(podcast.id)}).exec(function(err, media) {
          if (err) res.send(err, 500);

          Analytics.registerHit('podcast', req.param('id'));

          res.header('Content-Type', 'text/xml; charset=UTF-8');

          res.view({
            layout: 'rss',
            podcast: podcast,
            ministry: ministry,
            podcastMedia: media
          });
        });
      });
    });
  },
	
  subscribers: function(req, res) {
    var statsDate = Number(moment().subtract('week', 1).format('GGGGWW'));

    Stats.findOne({object: req.param('id'), type: 'podcast', date: statsDate}, function foundStatsTracking(err, stat) {
      if (err) return sails.log.error('Finding stats: ' + err);

      if (!stat) return res.send(200, {subscribers: 0});

      return res.send(200, {subscribers: Math.round(stat.count/7)});
    });
  },

};
